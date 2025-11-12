import React, { useCallback } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Icon from "@mui/material/Icon";
import { useDropzone } from "react-dropzone";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import { useMaterialUIController } from "context";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

function MenuDialog({ open, onClose, onSave, formData, setFormData }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const theme = useTheme();

  //  Enhanced onDrop with better file validation
  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      console.log("=== FILE DROP EVENT ===");
      console.log("Accepted files:", acceptedFiles);
      console.log("Rejected files:", rejectedFiles);

      if (rejectedFiles && rejectedFiles.length > 0) {
        const errors = rejectedFiles[0].errors;
        let errorMessage = "Không thể tải tệp: ";

        errors.forEach((error) => {
          if (error.code === "file-too-large") {
            errorMessage += "Tệp quá lớn (tối đa 5MB). ";
          } else if (error.code === "file-invalid-type") {
            errorMessage += "Định dạng tệp không hợp lệ. ";
          } else {
            errorMessage += error.message + " ";
          }
        });

        alert(errorMessage);
        return;
      }

      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        console.log("Selected file details:", {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          instanceof_File: file instanceof File,
        });

        //  Store the actual File object
        setFormData((prevData) => {
          const newData = { ...prevData, image: file };
          console.log("Updated formData with new image:", newData);
          return newData;
        });
      }
    },
    [setFormData]
  );

  //  Enhanced dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    maxSize: 5242880, // 5MB
    multiple: false,
    noKeyboard: true,
  });

  //  Enhanced input change handler
  const handleInputChange = useCallback(
    (field, value) => {
      console.log(`=== INPUT CHANGE ===`);
      console.log(`Field: ${field}`);
      console.log(`Value:`, value);
      console.log(`Type: ${typeof value}`);

      let processedValue = value;

      //  Enhanced value processing
      if (field === "price") {
        // Handle price as string until save
        processedValue = value;
      } else if (field === "is_available") {
        processedValue = Boolean(value);
      } else if (field === "image") {
        //  Handle image specially
        if (value === null || value === undefined) {
          processedValue = null;
        } else if (value instanceof File) {
          processedValue = value;
        } else if (typeof value === "string") {
          processedValue = value; // Keep existing URL
        } else {
          console.warn("Unexpected image value type:", typeof value);
          processedValue = value;
        }
      }

      setFormData((prevData) => {
        const newData = {
          ...prevData,
          [field]: processedValue,
        };
        console.log(`Updated formData:`, newData);
        return newData;
      });
    },
    [setFormData]
  );

  //  Enhanced switch change handler
  const handleSwitchChange = useCallback(
    (field, checked) => {
      console.log(`=== SWITCH CHANGE ===`);
      console.log(`Field: ${field}`);
      console.log(`Previous value: ${formData[field]}`);
      console.log(`New value: ${checked}`);
      console.log(`Type: ${typeof checked}`);

      setFormData((prevData) => {
        const newData = {
          ...prevData,
          [field]: Boolean(checked),
        };
        console.log("Updated formData after switch change:", newData);
        return newData;
      });
    },
    [formData, setFormData]
  );

  //  Enhanced image removal handler
  const handleRemoveImage = useCallback(() => {
    console.log("Removing image...");
    setFormData((prevData) => {
      const newData = { ...prevData, image: null };
      console.log("FormData after image removal:", newData);
      return newData;
    });
  }, [setFormData]);

  //  Enhanced image source handler
  const getImageSrc = useCallback(() => {
    if (!formData.image) return null;

    if (formData.image instanceof File) {
      console.log("Creating object URL for File");
      return URL.createObjectURL(formData.image);
    } else if (typeof formData.image === "string") {
      console.log("Using existing image URL");
      return formData.image;
    }

    console.warn("Unexpected image type:", typeof formData.image);
    return null;
  }, [formData.image]);

  // Extract props before the return statement
  const rootProps = getRootProps();
  const inputProps = getInputProps();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          bgcolor: darkMode ? theme.palette.background.card : theme.palette.background.paper,
          color: darkMode ? theme.palette.white.main : theme.palette.text.main,
          boxShadow: darkMode ? theme.boxShadows.xxl : theme.boxShadows.lg,
          borderRadius: "12px",
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          color: darkMode ? theme.palette.white.main : theme.palette.text.main,
        }}
      >
        <MDBox display="flex" alignItems="center" gap={2}>
          <Icon sx={{ fontSize: "2rem", color: "info.main" }}>
            {formData.id ? "edit" : "add_circle"}
          </Icon>
          <MDTypography variant="h4" fontWeight="bold">
            {formData.id ? "Chỉnh sửa món ăn" : "Thêm món ăn mới"}
          </MDTypography>
        </MDBox>
      </DialogTitle>

      <DialogContent
        sx={{
          pt: 3,
          px: 4,
          color: darkMode ? theme.palette.white.main : theme.palette.text.main,
        }}
      >
        <MDBox display="flex" flexDirection="column" gap={3}>
          {/*  Tên món */}
          <MDInput
            label="Tên món"
            fullWidth
            value={formData.name || ""}
            onChange={(e) => handleInputChange("name", e.target.value)}
            required
            InputLabelProps={{ shrink: true }}
            InputProps={{
              sx: {
                height: "56px",
                backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : undefined,
              },
            }}
          />

          {/*  Giá */}
          <MDInput
            label="Giá (VNĐ)"
            type="number"
            inputProps={{ min: 0, step: 1000 }}
            fullWidth
            value={formData.price || ""}
            onChange={(e) => handleInputChange("price", e.target.value)}
            required
            InputLabelProps={{ shrink: true }}
            InputProps={{
              sx: {
                height: "56px",
                backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : undefined,
              },
            }}
          />

          {/*  Danh mục */}
          <FormControl fullWidth>
            <InputLabel
              id="category-label"
              sx={{
                color: darkMode ? theme.palette.grey[400] : undefined,
              }}
            >
              Danh mục
            </InputLabel>
            <Select
              labelId="category-label"
              value={formData.category || "food"}
              label="Danh mục"
              onChange={(e) => handleInputChange("category", e.target.value)}
              sx={{
                height: "56px",
                backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : undefined,
                color: darkMode ? theme.palette.white.main : undefined,
              }}
            >
              <MenuItem value="food">
                <MDBox display="flex" alignItems="center" gap={1}>
                  <Icon sx={{ color: "warning.main" }}>restaurant</Icon>
                  Món ăn
                </MDBox>
              </MenuItem>
              <MenuItem value="drink">
                <MDBox display="flex" alignItems="center" gap={1}>
                  <Icon sx={{ color: "success.main" }}>local_drink</Icon>
                  Đồ uống
                </MDBox>
              </MenuItem>
            </Select>
          </FormControl>

          {/*  Mô tả */}
          <MDInput
            label="Mô tả"
            fullWidth
            multiline
            rows={4}
            value={formData.description || ""}
            onChange={(e) => handleInputChange("description", e.target.value)}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              sx: {
                backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : undefined,
              },
            }}
          />

          {/*  Trạng thái món ăn */}
          <MDBox
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            p={2}
            sx={{
              backgroundColor: darkMode ? "rgba(255, 255, 255, 0.05)" : "grey.50",
              borderRadius: "8px",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <MDBox display="flex" alignItems="center" gap={1}>
              <Icon
                sx={{
                  color: formData.is_available ? "success.main" : "error.main",
                  fontSize: "1.5rem",
                }}
              >
                {formData.is_available ? "check_circle" : "cancel"}
              </Icon>
              <MDBox>
                <MDTypography variant="body1" fontWeight="medium">
                  Trạng thái món ăn
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  {formData.is_available ? "Món này đang có sẵn" : "Món này đã hết"}
                </MDTypography>
                {/*  Debug info - remove in production */}
                <MDTypography variant="caption" color="grey.500" sx={{ fontSize: "0.7rem" }}>
                  Current: {String(formData.is_available)} ({typeof formData.is_available})
                </MDTypography>
              </MDBox>
            </MDBox>

            <MDBox display="flex" alignItems="center" gap={1}>
              <MDTypography
                variant="body2"
                color={formData.is_available ? "success" : "error"}
                fontWeight="medium"
              >
                {formData.is_available ? "Còn món" : "Hết món"}
              </MDTypography>
              <Switch
                checked={Boolean(formData.is_available)}
                onChange={(event) => {
                  console.log("Switch onChange event:", event.target.checked);
                  handleSwitchChange("is_available", event.target.checked);
                }}
                color="success"
                size="medium"
                inputProps={{ "aria-label": "Trạng thái món ăn" }}
              />
            </MDBox>
          </MDBox>

          {/*  Enhanced Image Upload */}
          <MDBox>
            <MDTypography variant="body1" fontWeight="medium" mb={1}>
              Hình ảnh món ăn
            </MDTypography>

            {/*  Debug info - remove in production */}
            <MDTypography variant="caption" color="grey.500" sx={{ fontSize: "0.7rem", mb: 1 }}>
              Image type: {formData.image ? typeof formData.image : "null"} | Is File:{" "}
              {formData.image instanceof File ? "Yes" : "No"}
            </MDTypography>

            <MDBox
              {...rootProps}
              sx={{
                border: `2px dashed ${
                  darkMode ? theme.palette.grey[600] : theme.palette.grey[400]
                }`,
                borderRadius: "8px",
                p: 3,
                textAlign: "center",
                cursor: "pointer",
                minHeight: "120px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: isDragActive
                  ? darkMode
                    ? "rgba(255, 255, 255, 0.1)"
                    : theme.palette.grey[200]
                  : darkMode
                  ? "rgba(255, 255, 255, 0.05)"
                  : theme.palette.background.paper,
                "&:hover": {
                  bgcolor: darkMode ? "rgba(255, 255, 255, 0.08)" : theme.palette.grey[100],
                  borderColor: "info.main",
                },
                transition: "all 0.3s ease",
              }}
            >
              {/* eslint-disable-next-line*/}
              <input {...inputProps} />
              <Icon sx={{ fontSize: "3rem", color: "grey.400", mb: 1 }}>
                {isDragActive ? "cloud_upload" : "add_photo_alternate"}
              </Icon>
              <MDTypography variant="body2" color={darkMode ? "white" : "text"} textAlign="center">
                {isDragActive
                  ? "Thả tệp vào đây..."
                  : "Kéo và thả hình ảnh vào đây hoặc nhấp để chọn tệp"}
              </MDTypography>
              <MDTypography variant="caption" color="text" mt={1}>
                Định dạng: JPG, PNG, GIF, WEBP. Tối đa 5MB
              </MDTypography>
            </MDBox>
          </MDBox>

          {/* Enhanced Image Preview */}
          {formData.image && (
            <MDBox>
              <MDTypography variant="body1" fontWeight="medium" mb={2}>
                Xem trước hình ảnh
              </MDTypography>
              <MDBox display="flex" justifyContent="center">
                <MDBox position="relative">
                  <img
                    src={getImageSrc()}
                    alt="Preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "250px",
                      objectFit: "contain",
                      borderRadius: "8px",
                      boxShadow: darkMode ? theme.boxShadows.md : "0px 2px 8px rgba(0,0,0,0.1)",
                    }}
                    onError={(e) => {
                      console.error("Image load error:", e);
                      e.target.style.display = "none";
                    }}
                  />
                  <MDButton
                    variant="gradient"
                    color="error"
                    size="small"
                    onClick={handleRemoveImage}
                    sx={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      minWidth: "auto",
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                    }}
                  >
                    <Icon sx={{ fontSize: "1rem" }}>close</Icon>
                  </MDButton>
                </MDBox>
              </MDBox>
            </MDBox>
          )}
        </MDBox>
      </DialogContent>

      <DialogActions
        sx={{
          px: 4,
          pb: 3,
          pt: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          gap: 2,
          justifyContent: "center",
        }}
      >
        <MDButton
          variant="outlined"
          color="secondary"
          onClick={onClose}
          size="large"
          sx={{ minWidth: "120px" }}
        >
          <Icon sx={{ mr: 1 }}>close</Icon>
          Hủy
        </MDButton>
        <MDButton
          onClick={onSave}
          color="info"
          variant="gradient"
          disabled={!formData.name || !formData.price}
          size="large"
          sx={{ minWidth: "120px" }}
        >
          <Icon sx={{ mr: 1 }}>{formData.id ? "save" : "add"}</Icon>
          {formData.id ? "Cập nhật" : "Thêm mới"}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

MenuDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  formData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    name: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    category: PropTypes.oneOf(["food", "drink"]),
    description: PropTypes.string,
    is_available: PropTypes.bool,
    image: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  }).isRequired,
  setFormData: PropTypes.func.isRequired,
};

export default MenuDialog;
