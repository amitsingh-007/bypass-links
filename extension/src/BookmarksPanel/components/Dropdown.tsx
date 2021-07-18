import {
  Autocomplete,
  AutocompleteRenderGetTagProps,
  AutocompleteRenderInputParams,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectProps,
  TextField,
} from "@material-ui/core";
import { memo, useState } from "react";
import { IPersonWithImage } from "SrcPath/PersonsPanel/interfaces/persons";

export const FolderDropdown: React.FC<{
  folder: string;
  folderList: string[];
  handleFolderChange: SelectProps<string>["onChange"];
  hideLabel?: boolean;
  fullWidth?: boolean;
}> = ({
  folder,
  folderList,
  handleFolderChange,
  hideLabel = false,
  fullWidth = false,
}) => {
  if (!folderList || folderList.length < 1) {
    return null;
  }
  return (
    <FormControl
      variant="outlined"
      size="small"
      color="secondary"
      fullWidth={fullWidth}
    >
      {!hideLabel ? <InputLabel id="folders">Folder</InputLabel> : null}
      <Select labelId="folders" value={folder} onChange={handleFolderChange}>
        {folderList.map((folder) => (
          <MenuItem key={folder} value={folder}>
            {folder}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export const PersonsDropdown = memo<{
  taggedPersons: IPersonWithImage[];
  personList: IPersonWithImage[];
  loading: boolean;
  handlePersonsChange: (event: any, newValue: IPersonWithImage[]) => void;
}>(function PersonsDropdown({
  taggedPersons,
  personList = [],
  loading,
  handlePersonsChange,
}) {
  const [inputText, setInputText] = useState("");

  const onUserInputChange = (_event: any, newInputValue: string) => {
    setInputText(newInputValue);
  };

  const renderUserInput = (params: AutocompleteRenderInputParams) => (
    <TextField
      {...params}
      label="Tagged Persons"
      color="secondary"
      InputProps={{
        ...params.InputProps,
        color: "secondary",
        endAdornment: (
          <>
            {loading ? (
              <CircularProgress
                color="inherit"
                size={20}
                sx={{ marginRight: "35px" }}
              />
            ) : null}
            {params.InputProps.endAdornment}
          </>
        ),
      }}
      placeholder="Select Person"
    />
  );

  const renderSelectedOptions = (
    value: IPersonWithImage[],
    getTagProps: AutocompleteRenderGetTagProps
  ) =>
    value.map((option, index) => (
      <Chip
        {...getTagProps({ index })}
        key={option.name}
        label={option.name}
        avatar={<Avatar src={option.imageUrl} alt={option.name} />}
      />
    ));

  const renderOptions = (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: IPersonWithImage
  ) => (
    <Box
      component="li"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      {...props}
    >
      <Avatar
        alt={option.name}
        src={option.imageUrl}
        sx={{ height: "25px", width: "25px" }}
      />
      <Box component="span" sx={{ marginLeft: "10px" }}>
        {option.name}
      </Box>
    </Box>
  );

  return (
    <Autocomplete
      multiple
      fullWidth
      limitTags={2}
      loading={loading}
      options={personList}
      value={taggedPersons}
      onChange={handlePersonsChange}
      inputValue={inputText}
      onInputChange={onUserInputChange}
      getOptionLabel={(option) => option.name}
      renderInput={renderUserInput}
      renderOption={renderOptions}
      renderTags={renderSelectedOptions}
    />
  );
});
