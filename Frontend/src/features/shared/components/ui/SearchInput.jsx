import { Search } from "lucide-react";

import Input from "./Input";

const SearchInput = ({
  label,
  placeholder = "Search",
  ...props
}) => {
  return (
    <Input
      label={label}
      placeholder={placeholder}
      icon={<Search className="h-4 w-4" />}
      {...props}
    />
  );
};

export default SearchInput;
