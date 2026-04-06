"use client";

export default function LinkedInLoginButton() {
  const handleLogin = () => {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/linkedin/callback`;
    const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || "78i0brb1nbng8g";
    const scope = "r_liteprofile r_emailaddress";

    const linkedinUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${encodeURIComponent(
      scope
    )}`;

    window.location.href = linkedinUrl;
  };

  return (
    <button onClick={handleLogin} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      Login with LinkedIn
    </button>
  );
}
