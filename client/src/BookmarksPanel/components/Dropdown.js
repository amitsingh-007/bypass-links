import {
  Autocomplete,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";
import { memo, useState } from "react";
import { getSortedPersons } from "SrcPath/PersonsPanel/utils";

export const FolderDropdown = ({
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

export const PersonsDropdown = memo(
  ({ taggedPersons, personList = [], loading, handlePersonsChange }) => {
    const [inputText, setInputText] = useState("");

    const onUserInputChange = (_event, newInputValue) => {
      setInputText(newInputValue);
    };

    const renderUserInout = (params) => (
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

    const renderSelectedOptions = (value, getTagProps) =>
      value.map((option, index) => (
        <Chip
          label={option.name}
          avatar={<Avatar src={option.imageUrl} alt={option.name} />}
          {...getTagProps({ index })}
        />
      ));

    const renderOptions = (props, option) => (
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

    const sortedPersons = getSortedPersons(personList);
    return (
      <Autocomplete
        multiple
        fullWidth
        limitTags={2}
        loading={loading}
        options={sortedPersons}
        value={taggedPersons}
        onChange={handlePersonsChange}
        inputValue={inputText}
        onInputChange={onUserInputChange}
        getOptionLabel={(option) => option.name}
        renderInput={renderUserInout}
        renderOption={renderOptions}
        renderTags={renderSelectedOptions}
      />
    );
  }
);
