import { createTheme } from "@mui/material";

type PaletteColor = "primary" | "secondary" | "info" | "error";

const defaultTheme = createTheme({
  palette: {
    primary: {
      main: "#3E4EEC",
    },
    secondary: {
      light: "#9FA9F3",
      main: "#5366EB",
      dark: "#3F55E9",
    },
    success: {
      main: "#42B396",
    },
    error: {
      main: "#EC6F7B",
    },
    info: {
      light: "#B4E5FC",
      main: "#1DACF7",
      dark: "#1DACF7",
    },
    text: {
      secondary: "#666F7A",
    },
    tertiary: {
      light: "#999fa7",
      main: "#808791",
      dark: "#595e65",
      contrastText: "#000000",
    },
    //tertiary: palette.augmentColor({color: {main: '#808791'}})
  },
  typography: {
    fontFamily: "intertight",
    h1: { fontSize: "76px", lineHeight: "105%", fontWeight: 400 },
    h2: { fontSize: "61px", lineHeight: "100%", fontWeight: 400 },
    h3: { fontSize: "48px", lineHeight: "120%", fontWeight: 400 },
    h4: { fontSize: "39px", lineHeight: "110%", fontWeight: 400 },
    h5: { fontSize: "31px", lineHeight: "120%", fontWeight: 400 },
    h6: { fontSize: "25px", lineHeight: "115%", fontWeight: 400 },
    subtitle1: { fontSize: "20px", lineHeight: "125%", fontWeight: 400 },
    body1: { fontSize: "16px", lineHeight: "125%", fontWeight: 400 },
    body2: { fontSize: "14px", lineHeight: "125%", fontWeight: 400 },
    caption: { fontSize: "12px", fontWeight: 400 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "20px",
          fontSize: "16px",
          padding: "8px 24px",
          height: "36px",
          textTransform: "none",
          boxShadow: "none",
          fontWeight: 400,
        },
        sizeSmall: {
          fontSize: "14px",
          height: "30px",
        },
        // @ts-ignore
        link: ({ theme }) => {
          return {
            textDecoration: "underline",
            padding: "0 1px",
            height: "auto",
            color: theme.palette.text.secondary,
            "&:hover": {
              backgroundColor: "transparent",
            },
          };
        },
        linkSizeSmall: {
          height: "18px",
          minWidth: 0,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: ({ ownerState, theme }) => {
          const color =
            (ownerState?.color &&
            ["primary", "secondary", "info", "error"].indexOf(
              ownerState?.color,
            ) !== -1
              ? theme.palette[ownerState?.color as PaletteColor]?.main
              : null) || theme.palette.grey.A200;
          const contrastColor =
            (ownerState?.color &&
            ["primary", "secondary", "info", "error"].indexOf(
              ownerState?.color,
            ) !== -1
              ? theme.palette[ownerState?.color as PaletteColor]?.contrastText
              : null) || theme.palette.grey["600"];
          const variant = ownerState.variant || "default";
          switch (variant) {
            case "contained":
              return {
                background: color,
                color: contrastColor,
                "&:hover": {
                  background: color,
                },
              };
            case "outlined":
              return {
                border: `1px solid ${color}`,
              };
            default:
              return {};
          }
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          fontSize: "16px",
          lineHeight: "20px",
          height: "auto!important",
        },
        root: {
          height: "40px",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "24px",
        },
        input: {
          padding: "10px 24px",
        },
        notchedOutline: {
          padding: "0 24px",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => {
          return {
            "& .MuiOutlinedInput-root": {},
            "& .MuiInputBase-colorPrimary:not(.Mui-disabled):not(.Mui-error)": {
              "& fieldset": {
                borderColor: "#B2B7BD",
              },
              "&:hover fieldset": {
                borderColor: theme.palette.secondary.main,
              },
              "&.Mui-focused fieldset": {
                borderColor: theme.palette.primary.main,
              },
            },
            "& .MuiInputBase-colorSuccess:not(.Mui-disabled):not(.Mui-error)": {
              "& fieldset": {
                borderColor: theme.palette.success.main,
              },
              "&:hover fieldset": {
                borderColor: theme.palette.success.light,
              },
              "&.Mui-focused fieldset": {
                borderColor: theme.palette.success.main,
              },
            },
            "& .Mui-error": {
              "& fieldset": {
                borderColor: "#B2B7BD",
              },
              "&:hover fieldset": {
                borderColor: theme.palette.error.light,
              },
              "&.Mui-focused fieldset": {
                borderColor: theme.palette.error.main,
              },
            },
          };
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        outlined: ({ theme }) => {
          return {
            height: "auto",
            lineHeight: "20px",
            fontSize: "16px",
            top: "-6px",
            left: "16px",
            "&.Mui-focused": {
              top: "0",
              left: "16px",
            },
            '&.Mui-error:not([data-shrink="true"])': {
              color: theme.palette.text.secondary,
            },
            "&.MuiInputLabel-shrink": {
              top: "0",
            },
          };
        },
        standard: {
          top: "8px",
          padding: "0 8px",
          "&.MuiInputLabel-shrink": {
            top: "8px",
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {},
      },
    },
    MuiAppBar: {
      styleOverrides: {
        positionFixed: {
          background: "white",
          //color: 'black',
          top: "24px",
          left: "0",
          right: "50px",
          height: "68px",
          margin: "0 100px",
          padding: "16px",
          borderRadius: "48px",
          width: "auto",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        filled: ({ theme, ownerState }) => {
          if (ownerState.color && ownerState.color !== "default") {
            const palette = theme.palette[ownerState.color];
            if (palette) {
              return {
                background: palette.light,
                color: palette.dark,
              };
            }
          }
          return {};
        },
        sizeSmall: {
          height: "20px",
          padding: "4px 10px",
        },
        labelSmall: {
          fontSize: "12px",
          padding: 0,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paperWidthSm: {
          maxWidth: "530px",
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: "0 48px",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontSize: "20px",
          fontStyle: "normal",
          fontWeight: 600,
          lineHeight: "125%",
          marginLeft: "8px",
          marginRight: "8px",
        },
      },
    },
  },
});

export default defaultTheme;
