import clsx from "clsx";

interface Button {
  id?: string;
  label: string;
  icon?: any;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "submit" | "reset" | "button";
}

export const Button: React.FC<Button> = ({ id, label, className, onClick, icon, disabled, type }) => {
  return (
    <button
      id={id}
      className={clsx(
        "w-full cursor-pointer rounded-[8px] border flex justify-center gap-3 border p-4",
        className
      )}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      <span>{label}</span>
      {icon}
    </button>
  );
};
