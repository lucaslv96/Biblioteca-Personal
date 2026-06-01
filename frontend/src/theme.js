import { alpha, createTheme } from "@mui/material/styles";

export function buildAppTheme(mode = "light") {
  const isDark = mode === "dark";

  const colors = {
    primary: "#2e7d32",
    primaryDark: "#1f5a24",
    primaryLight: "#dfeede",
    secondary: "#c9a227",
    secondaryDark: "#967712",
    secondaryLight: "#f3e4ae",
    backgroundDefault: isDark ? "#161512" : "#f7f0e3",
    backgroundPaper: isDark ? "#211f1a" : "#ffffff",
    backgroundSoft: isDark ? "#2b281f" : "#f3eee4",
    divider: isDark ? "#3a352a" : "#e8dfcf",
    textPrimary: isDark ? "#f7f3ea" : "#1e293b",
    textSecondary: isDark ? "#c8bdaa" : "#71695d",
  };

  return createTheme({
    palette: {
      mode,
      primary: {
        main: colors.primary,
        dark: colors.primaryDark,
        light: colors.primaryLight,
        contrastText: "#ffffff",
      },
      secondary: {
        main: colors.secondary,
        dark: colors.secondaryDark,
        light: colors.secondaryLight,
        contrastText: "#1e293b",
      },
      success: {
        main: "#2e7d32",
      },
      warning: {
        main: "#c98514",
      },
      error: {
        main: "#b84a3a",
      },
      background: {
        default: colors.backgroundDefault,
        paper: colors.backgroundPaper,
      },
      divider: colors.divider,
      text: {
        primary: colors.textPrimary,
        secondary: colors.textSecondary,
      },
    },
    shape: {
      borderRadius: 18,
    },
    typography: {
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h1: {
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "clamp(2rem, 4vw, 3.4rem)",
        fontWeight: 900,
        letterSpacing: 0,
        lineHeight: 1.02,
      },
      h2: {
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "1.55rem",
        fontWeight: 850,
        letterSpacing: 0,
        lineHeight: 1.15,
      },
      h3: {
        fontSize: "1rem",
        fontWeight: 850,
        letterSpacing: 0,
        lineHeight: 1.2,
      },
      button: {
        fontWeight: 850,
        letterSpacing: 0,
        textTransform: "none",
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            minWidth: 320,
            background:
              mode === "dark"
                ? `radial-gradient(circle at top, ${alpha(colors.secondaryDark, 0.12)} 0, transparent 34%), ${colors.backgroundDefault}`
                : `radial-gradient(circle at 55% 0%, ${alpha("#fff8e8", 0.95)} 0, transparent 42%), radial-gradient(circle at 78% 22%, ${alpha(colors.secondaryLight, 0.3)} 0, transparent 36%), ${colors.backgroundDefault}`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            minHeight: 42,
            borderRadius: 999,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 999,
          },
        },
      },
      MuiFab: {
        styleOverrides: {
          root: {
            boxShadow: `0 18px 38px ${alpha(colors.primaryDark, 0.26)}`,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: "outlined",
          size: "small",
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            backgroundColor: isDark
              ? alpha("#ffffff", 0.045)
              : alpha("#ffffff", 0.9),
          },
          input: {
            paddingTop: 12,
            paddingBottom: 12,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            fontWeight: 850,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 28,
            backgroundImage: "none",
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
            boxShadow: "0 22px 60px rgba(21, 15, 9, 0.22)",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            minHeight: 38,
            borderRadius: 999,
            fontWeight: 850,
            textTransform: "none",
          },
        },
      },
    },
  });
}
