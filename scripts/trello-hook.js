#!/usr/bin/env node
/**
 * Claude Code PostToolUse hook — syncs TaskCreate / TaskUpdate to Trello.
 *
 * Called automatically by Claude Code after TaskCreate or TaskUpdate tool use.
 * Reads the hook event JSON from stdin, then:
 *   TaskCreate  → creates a Trello card in the configured list
 *   TaskUpdate  → moves the card to "Done" when status becomes "completed"
 *
 * Config keys expected in backend/.env:
 *   TRELLO_API_KEY   — Trello developer API key
 *   TRELLO_TOKEN     — Trello user token
 *   TRELLO_BOARD_ID  — target board ID
 *   TRELLO_LIST_ID   — (optional) pin to a specific list ID;
 *                      auto-discovers the first "To Do / Backlog" list if absent
 *
 * Task → card mapping is persisted in .claude/.trello-task-map.json (gitignored).
 */

'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
const ENV_FILE = path.join(ROOT, 'backend', '.env');
const MAP_FILE = path.join(ROOT, '.claude', '.trello-task-map.json');

// ── env / map helpers ─────────────────────────────────────────────────────────

function loadEnv() {
  try {
    return Object.fromEntries(
      fs.readFileSync(ENV_FILE, 'utf8')
        .split('\n')
        .filter(l => l.includes('=') && !l.trimStart().startsWith('#'))
        .map(l => {
          const eq = l.indexOf('=');
          const k = l.slice(0, eq).trim();
          let v = l.slice(eq + 1).trim();
          if (/^["'].*["']$/.test(v)) v = v.slice(1, -1);
          return [k, v];
        })
        .filter(([, v]) => v !== '')
    );
  } catch {
    return {};
  }
}

function loadMap() {
  try { return JSON.parse(fs.readFileSync(MAP_FILE, 'utf8')); }
  catch { return {}; }
}

function saveMap(map) {
  fs.mkdirSync(path.dirname(MAP_FILE), { recursive: true });
  fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 2) + '\n');
}

// ── Trello REST helper ────────────────────────────────────────────────────────

function trello(method, endpoint, params) {
  return new Promise((resolve, reject) => {
    const qs = new URLSearchParams(params).toString();
    const options = {
      hostname: 'api.trello.com',
      port: 443,
      path: `/1/${endpoint}?${qs}`,
      method,
      timeout: 10000, // 10 second timeout
    };
    const req = https.request(options, res => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        reject(new Error(`Trello API returned ${res.statusCode}`));
        return;
      }
      
      let body = '';
      res.on('data', c => (body += c));
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch { resolve(body); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => {
    req.destroy();
    reject(new Error('Trello API request timed out'));
   });
    req.end();
  });
}

async function fetchLists(boardId, creds) {
  const lists = await trello('GET', `boards/${boardId}/lists`, { ...creds, fields: 'id,name' });
  if (!Array.isArray(lists) || !lists.length) throw new Error('No lists found on board ' + boardId);
  return lists;
}

async function resolveInboxListId(boardId, creds) {
  const lists = await fetchLists(boardId, creds);
  return (lists.find(l => /to.?do|backlog|inbox|todo/i.test(l.name)) ?? lists[0]).id;
}

async function resolveDoneListId(boardId, creds) {
  const lists = await fetchLists(boardId, creds);
  const done = lists.find(l => /done|complet|finish/i.test(l.name));
  return done?.id ?? null;
}

// ── main ──────────────────────────────────────────────────────────────────────

async function run(event) {
  const env = loadEnv();
  const {
    TRELLO_API_KEY: key,
    TRELLO_TOKEN: token,
    TRELLO_BOARD_ID: boardId,
    TRELLO_LIST_ID: fixedListId,
  } = env;

  if (!key || !token || !boardId) {
    process.stderr.write(
      '[trello-hook] Missing TRELLO_API_KEY / TRELLO_TOKEN / TRELLO_BOARD_ID in backend/.env\n'
    );
    return;
  }

  const creds = { key, token };
  const { tool_name, tool_input = {}, tool_response = {} } = event;

  // ── TaskCreate → new card ─────────────────────────────────────────────────
  if (tool_name === 'TaskCreate') {
    const taskId = tool_response?.id ?? tool_response?.task_id;
    const name = tool_input?.subject ?? tool_input?.title ?? 'Untitled Task';
    const desc = tool_input?.description ?? '';

    const listId = fixedListId ?? await resolveInboxListId(boardId, creds);
    const card = await trello('POST', 'cards', { ...creds, idList: listId, name, desc });

    if (card?.id && taskId) {
      const map = loadMap();
      map[String(taskId)] = card.id;
      saveMap(map);
    }

    if (card?.shortUrl) {
      process.stdout.write(`[trello-hook] Card created: "${card.name}" → ${card.shortUrl}\n`);
    }

  // ── TaskUpdate → move card on status change ───────────────────────────────
  } else if (tool_name === 'TaskUpdate') {
    const taskId = tool_input?.taskId ?? tool_input?.id;
    const newStatus = tool_input?.status;
    if (!taskId || !newStatus) return;

    const map = loadMap();
    const cardId = map[String(taskId)];
    if (!cardId) return;

    if (newStatus === 'completed') {
      const doneListId = await resolveDoneListId(boardId, creds);
      if (doneListId) {
        await trello('PUT', `cards/${cardId}`, { ...creds, idList: doneListId });
        process.stdout.write(`[trello-hook] Card moved to Done list\n`);
      }
    } else if (newStatus === 'in_progress') {
      // optionally move to "In Progress" list if one exists
      const lists = await fetchLists(boardId, creds);
      const inProgress = lists.find(l => /in.?progress|doing|wip/i.test(l.name));
      if (inProgress) {
        await trello('PUT', `cards/${cardId}`, { ...creds, idList: inProgress.id });
        process.stdout.write(`[trello-hook] Card moved to In Progress list\n`);
      }
    }
  }
}

// ── read stdin ────────────────────────────────────────────────────────────────

let raw = '';
process.stdin.on('data', c => (raw += c));
process.stdin.on('end', () => {
  let event = {};
  try { event = JSON.parse(raw || '{}'); } catch { /* ignore malformed input */ }
  run(event).catch(e => {
    process.stderr.write(`[trello-hook] Error: ${e.message}\n`);
  });
});
