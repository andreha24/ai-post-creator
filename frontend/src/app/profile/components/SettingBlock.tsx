interface SettingBlockWrapperProps {
  title: string;
  icon: any;
  children: React.ReactNode;
}

export const SettingBlockWrapper: React.FC<SettingBlockWrapperProps> = ({
  title,
  icon,
  children,
}) => (
  <div className="flex p-6 gap-4 flex-col rounded-[8px] border app-surface app-border w-full">
    <div className="flex gap-3 text-m!">
      {icon}

      <span className="text-xl!">{title}</span>
    </div>

    {children}
  </div>
);
