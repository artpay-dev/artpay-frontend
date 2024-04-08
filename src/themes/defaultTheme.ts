import { createTheme } from "@mui/material";
import { Theme } from "../types";

type PaletteColor = "primary" | "secondary" | "info" | "error";

const defaultTheme: Theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1280,
      xl: 1440
    }
  },
  palette: {
    primary: {
      light: "#6576EE",
      main: "#3E4EEC",
      contrastText: "#FFF"
    },
    secondary: {
      light: "#ECEDFC",
      main: "#181F5D",
      dark: "#3F55E9",
      contrastText: "#FFF"
    },
    success: {
      main: "#42B396"
    },
    error: {
      main: "#EC6F7B"
    },
    info: {
      light: "#B4E5FC",
      main: "#1DACF7",
      dark: "#1DACF7"
    },
    text: {
      secondary: "#666F7A"
    },
    tertiary: {
      light: "#999fa7",
      main: "#808791",
      dark: "#595e65",
      contrastText: "#000000"
    },
    contrast: {
      main: "#fff",
      light: "#fff",
      dark: "#fff",
      contrastText: "#fff"
    }
    //tertiary: palette.augmentColor({color: {main: '#808791'}})
  },
  typography: {
    fontFamily: "intertight",
    display1: { fontSize: "88px", lineHeight: "100%", fontWeight: 400, display: "inline-block" },
    display2: { fontSize: "72px", lineHeight: "100%", fontWeight: 400, display: "inline-block" },
    display3: { fontSize: "56px", lineHeight: "100%", fontWeight: 400, display: "inline-block" },
    h1: { fontSize: "40px", lineHeight: "105%", fontWeight: 400 },
    h2: { fontSize: "36px", lineHeight: "105%", fontWeight: 500 },
    h3: { fontSize: "32px", lineHeight: "120%", fontWeight: 500 },
    h4: { fontSize: "24px", lineHeight: "110%", fontWeight: 500 },
    h5: { fontSize: "24px", lineHeight: "120%", fontWeight: 400 },
    h6: { fontSize: "24px", lineHeight: "115%", fontWeight: 400 },
    subtitle1: { fontSize: "16px", lineHeight: "125%", fontWeight: 500 },
    body1: { fontSize: "16px", lineHeight: "125%", fontWeight: 500 },
    body2: { fontSize: "12px", lineHeight: "120%", fontWeight: 500 },
    caption: { fontSize: "12px", fontWeight: 500, display: "inline-block", lineHeight: 1 }
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
          fontWeight: 400
        },
        sizeSmall: {
          fontSize: "14px",
          height: "30px"
        },
        // @ts-expect-error variante custom "contrast
        textContrast: ({ theme }) => {
          return {
            color: theme.palette.primary.main,
            background: theme.palette.contrast.main,
            "&:hover": {
              color: theme.palette.primary.main,
              background: theme.palette.contrast.main,
              opacity: "0.8"
            }
          };
        },
        // @ts-expect-error variante custom "contrast
        containedContrast: ({ theme }) => {
          return {
            color: theme.palette.primary.main,
            background: theme.palette.contrast.main,
            "&:hover": {
              color: theme.palette.primary.main,
              background: theme.palette.contrast.main,
              opacity: "0.8"
            }
          };
        },
        // @ts-expect-error variante custom "link"
        link: ({ theme }) => {
          return {
            textDecoration: "underline",
            padding: "0 1px",
            height: "auto",
            color: theme.palette.text.secondary,
            "&:hover": {
              backgroundColor: "transparent"
            }
          };
        },
        linkSizeSmall: {
          height: "18px",
          minWidth: 0
        },
        sizeLarge: {
          height: "auto!important",
          minHeight: "65px",
          minWidth: "160px",
          borderRadius: "64px",
          fontSize: "24px"
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: ({ ownerState, theme }) => {
          const color =
            (ownerState?.color && ["primary", "secondary", "info", "error"].indexOf(ownerState?.color) !== -1
              ? theme.palette[ownerState?.color as PaletteColor]?.main
              : null) || theme.palette.grey.A200;
          const contrastColor =
            (ownerState?.color && ["primary", "secondary", "info", "error"].indexOf(ownerState?.color) !== -1
              ? theme.palette[ownerState?.color as PaletteColor]?.contrastText
              : null) || theme.palette.grey["600"];

          const btnProps: { [key: string]: string | object } = {};
          if (ownerState.size === "xs") {
            btnProps["height"] = "20px";
            btnProps["width"] = "20px";
            btnProps["padding"] = "4px";
            btnProps[" .MuiSvgIcon-root"] = {
              height: "16px",
              width: "16px"
            };
          }

          const variant = ownerState.variant || "default";
          switch (variant) {
            case "contained":
              return {
                background: color,
                color: contrastColor,
                "&:hover": {
                  background: color
                }, ...btnProps
              };
            case "outlined":
              return {
                border: `1px solid ${color}`, ...btnProps
              };
            default:
              return { ...btnProps };
          }
        }
      }
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          fontSize: "16px",
          lineHeight: "20px",
          height: "auto!important"
        },
        root: {
          height: "40px"
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "24px"
        },
        input: {
          padding: "10px 24px"
        },
        notchedOutline: {
          padding: "0 24px"
        },
        adornedEnd: {
          paddingRight: 0,
          button: {
            height: "38px"
          }
        },
        adornedStart: {
          input: {
            paddingLeft: "8px"
          }
        }
      }
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          "&::before": {
            display: "none"
          },
          "&::after": {
            display: "none"
          },
          "&:hover": {
            background: "#ECEDFC"
          },
          input: {
            paddingTop: "6px"
          },
          background: "#ECEDFC!important",
          borderRadius: "20px"
        },
        adornedEnd: {
          paddingRight: "2px!important",
          button: {
            height: "36px"
          }
        },
        adornedStart: {
          input: {
            paddingLeft: "8px"
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => {
          return {
            "& .MuiOutlinedInput-root": {},
            "& .MuiInputBase-colorPrimary:not(.Mui-disabled):not(.Mui-error)": {
              "& fieldset": {
                borderColor: "#B2B7BD"
              },
              "&:hover fieldset": {
                borderColor: theme.palette.secondary.main
              },
              "&.Mui-focused fieldset": {
                borderColor: theme.palette.primary.main
              }
            },
            "& .MuiInputBase-colorSuccess:not(.Mui-disabled):not(.Mui-error)": {
              "& fieldset": {
                borderColor: theme.palette.success.main
              },
              "&:hover fieldset": {
                borderColor: theme.palette.success.light
              },
              "&.Mui-focused fieldset": {
                borderColor: theme.palette.success.main
              }
            },
            "& .Mui-error": {
              "& fieldset": {
                borderColor: "#B2B7BD"
              },
              "&:hover fieldset": {
                borderColor: theme.palette.error.light
              },
              "&.Mui-focused fieldset": {
                borderColor: theme.palette.error.main
              }
            }
          };
        }
      }
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
              left: "16px"
            },
            "&.Mui-error:not([data-shrink=\"true\"])": {
              color: theme.palette.text.secondary
            },
            "&.MuiInputLabel-shrink": {
              top: "0"
            }
          };
        },
        standard: {
          top: "8px",
          padding: "0 8px",
          "&.MuiInputLabel-shrink": {
            top: "8px"
          }
        }
      }
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {}
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0px 4px 16px 0px rgba(62, 78, 236, 0.15)"
        },
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
          width: "auto"
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        filled: ({ theme, ownerState }) => {
          if (ownerState.color && ownerState.color !== "default") {
            const palette = theme.palette[ownerState.color];
            if (palette) {
              return {
                background: palette.light,
                color: palette.contrastText
              };
            }
          }
          return {};
        },
        sizeSmall: {
          height: "20px",
          padding: "4px 10px"
        },
        //@ts-expect-error sizeLarge declared in types
        sizeLarge: {
          height: "36px",
          padding: "4px 10px"
        },
        labelLarge: {
          fontSize: "16px",
          fontWeight: 500
        },
        labelSmall: {
          fontSize: "12px",
          padding: 0
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {},
        paperWidthSm: {
          borderRadius: "8px!important",
          maxWidth: "530px"
        }
      }
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: "0 48px"
        }
      }
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: "8px"
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontSize: "16px",
          fontStyle: "normal",
          fontWeight: 600,
          lineHeight: "125%",
          marginLeft: "8px",
          marginRight: "8px"
        }
      }
    },
    MuiPopover: {
      styleOverrides: {
        paper: ({ theme }) => {
          return {
            color: theme.palette.contrast.main,
            backgroundColor: theme.palette.grey["800"]
          };
        }
      }
    },
    MuiFooter: {
      styleOverrides: {
        root: {
          backgroundColor: "#FAFAFB",
          "& a.link": {
            //color: "white"
            color: "#010F22",
            textDecoration: "none",
            fontWeight: 500
          },
          "& a.link-secondary": {
            //color: "white"
            color: "#010F22"
          },
          "& a.link:visited": {
            //color: "#96b1d7"
          }
        }
      }
    },
    MuiAccordionSummary: {
      styleOverrides: {
        expandIconWrapper: {
          "&.Mui-expanded": {
            transform: "rotate(225deg)"
          }
        },
        content: {
          fontSize: "39px",
          margin: "48px 0",
          "&.Mui-expanded": {
            margin: "16px 0"
          }
        }
      }
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          "&::before": {
            backgroundColor: "black"
          },
          "&.Mui-expanded::before": {
            opacity: 1
          }
        }
      }
    }
  }
});

// @ts-expect-error custom theme
const responsiveTheme = createTheme(defaultTheme, {
  typography: {
    display1: {
      [defaultTheme.breakpoints.only("xs")]: {
        fontSize: "40px"
      }
    },
    display3: {
      [defaultTheme.breakpoints.only("xs")]: {
        fontSize: "40px"
      }
    },
    h5: {
      [defaultTheme.breakpoints.only("xs")]: {
        fontSize: "25px"
      }
    },
    h6: {
      [defaultTheme.breakpoints.only("xs")]: {
        fontSize: "20px"
      }
    },
    subtitle1: {
      [defaultTheme.breakpoints.only("xs")]: {
        fontSize: "14px"
      }
    }
  }
});

export default responsiveTheme;
