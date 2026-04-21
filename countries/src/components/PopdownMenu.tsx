import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

interface MenuSection {
  titleKey: string;
  items: { path: string; labelKey: string; emoji: string }[];
}

const menuSections: MenuSection[] = [
  {
    titleKey: "menu.sectionFlagquiz",
    items: [
      { path: "/", labelKey: "menu.flagquiz", emoji: "\u{1F3C1}" },
      { path: "/skriv", labelKey: "menu.writeMode", emoji: "\u270D" },
      { path: "/daglig", labelKey: "menu.daily", emoji: "\u{1F4C6}" },
      { path: "/varldsdelar", labelKey: "menu.continent", emoji: "\u{1F310}" },
    ],
  },
  {
    titleKey: "menu.sectionMapquiz",
    items: [
      { path: "/varldskarta", labelKey: "menu.worldMap", emoji: "\u{1F5FA}\uFE0F" },
      { path: "/varldskarta/regioner", labelKey: "menu.continent", emoji: "\u{1F310}" },
      { path: "/landskap", labelKey: "menu.provinces", emoji: "\u{1F1F8}\u{1F1EA}" },
      { path: "/stater", labelKey: "menu.usStates", emoji: "\u{1F1FA}\u{1F1F8}" },
    ],
  },
  {
    titleKey: "menu.sectionOther",
    items: [
      { path: "/lander", labelKey: "menu.countries", emoji: "\u{1F30D}" },
      { path: "/om", labelKey: "menu.about", emoji: "\u{1F9FE}" },
    ],
  },
];

const PopdownMenu = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const currentLang = i18n.language.startsWith("en") ? "en" : "sv";

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (
    _event: React.MouseEvent<HTMLElement>,
    newLang: string | null
  ) => {
    if (newLang && newLang !== currentLang) {
      i18n.changeLanguage(newLang);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey && event.key === "m") {
      setAnchorEl((prevAnchorEl) =>
        prevAnchorEl ? null : menuButtonRef.current
      );
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <AppBar position="static">
      <Toolbar>
        <Box flexGrow={1} display="flex" justifyContent="center">
          <Typography variant="h4" component="div">
            {t("common.appName")}
          </Typography>
        </Box>
        <IconButton
          edge="end"
          color="inherit"
          aria-label="menu"
          onClick={handleMenuOpen}
          ref={menuButtonRef}
          sx={{ ml: "auto" }}
        >
          <MenuIcon sx={{ mr: 0.5 }} />
          <p>{t("menu.button")}</p>
        </IconButton>
        <Menu
          id="menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              minWidth: 280,
              py: 1,
            },
          }}
          MenuListProps={{ disablePadding: true }}
        >
          {menuSections.map((section, index) => (
            <Box key={section.titleKey} sx={{ py: 1 }}>
              <Typography
                variant="overline"
                sx={{
                  display: "block",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  color: "text.secondary",
                  px: 2,
                  mb: 0.5,
                }}
              >
                {t(section.titleKey)}
              </Typography>
              {section.items.map((item) => (
                <MenuItem
                  key={`${section.titleKey}-${item.path}-${item.labelKey}`}
                  onClick={() => {
                    navigate(item.path);
                    handleMenuClose();
                  }}
                  sx={{
                    borderRadius: 1,
                    px: 2,
                  }}
                >
                  <Typography textAlign="left" className="emoji">
                    {`${item.emoji} ${t(item.labelKey)}`}
                  </Typography>
                </MenuItem>
              ))}
              {index !== menuSections.length - 1 && (
                <Divider sx={{ my: 1, opacity: 0.3 }} />
              )}
            </Box>
          ))}
          <Divider sx={{ my: 1, opacity: 0.3 }} />
          <Box sx={{ py: 1, px: 2 }}>
            <Typography
              variant="overline"
              sx={{
                display: "block",
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: "text.secondary",
                mb: 0.5,
              }}
            >
              {t("menu.language")}
            </Typography>
            <ToggleButtonGroup
              value={currentLang}
              exclusive
              onChange={handleLanguageChange}
              size="small"
              fullWidth
            >
              <ToggleButton value="sv" aria-label="Svenska">
                {t("menu.swedish")}
              </ToggleButton>
              <ToggleButton value="en" aria-label="English">
                {t("menu.english")}
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default PopdownMenu;
