import { MenuItem, TextField as MuiTextField } from "@mui/material";

interface SelectItem {
  value: string;
  label: string;
}

interface TextField {
  label: string;
  icon: any;
  placeholder: string;
  registerName?: string;
  register?: any;
  selectList?: SelectItem[];
  multiline?: boolean;
  defaultValue?: string;
}

export const TextField: React.FC<TextField> = ({
  label,
  icon,
  placeholder,
  registerName,
  register,
  selectList,
  multiline,
  defaultValue,
}) => (
  <div className="flex flex-col gap-2">
    <div className="flex gap-2">
      {icon}
      <span>{label}</span>
    </div>

    {selectList ? (
      <MuiTextField
        select
        variant="filled"
        defaultValue={defaultValue}
        {...(register && registerName ? register(registerName) : {})}
      >
        {selectList.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </MuiTextField>
    ) : (
      <MuiTextField
        hiddenLabel
        multiline={multiline}
        placeholder={placeholder}
        className="w-full"
        variant="filled"
        {...(register && registerName ? register(registerName) : {})}
      />
    )}
  </div>
);
