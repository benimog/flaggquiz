import React, { useState, useEffect, useRef } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

interface MenuSection {
  title: string;
  items: { href: string; label: string; emoji: string }[];
}

const menuSections: MenuSection[] = [
  {
    title: "Flaggquiz",
    items: [
      { href: "/", label: "Flaggquiz", emoji: "🏁" },
      { href: "/write", label: "Skrivläge", emoji: "✍" },
      { href: "/daily", label: "Daglig", emoji: "📆" },
      { href: "/continents", label: "Världsdel", emoji: "🌐" },
    ],
  },
  {
    title: "Kartquiz",
    items: [
      { href: "/worldmap", label: "Världskarta", emoji: "🗺️" },
      { href: "/worldmap/regions", label: "Världsdel", emoji: "🌐" },
      { href: "/states", label: "Amerikanska stater", emoji: "🇺🇸" },
    ],
  },
  {
    title: "Övrigt",
    items: [
      { href: "/countries", label: "Länder & regioner", emoji: "🌍" },
      { href: "/about", label: "Om flaggquiz", emoji: "🧾" },
    ],
  },
];

const PopdownMenu = () => {

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
            Flaggquiz.se
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
          <MenuIcon />
          <p>Meny</p>
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
            <Box key={section.title} sx={{ py: 1 }}>
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
                {section.title}
              </Typography>
              {section.items.map((item) => (
                <MenuItem
                  key={item.href}
                  component={"a"}
                  href={item.href}
                  onClick={handleMenuClose}
                  sx={{
                    borderRadius: 1,
                    px: 2,
                  }}
                >
                  <Typography textAlign="left" className="emoji">
                    {`${item.emoji} ${item.label}`}
                  </Typography>
                </MenuItem>
              ))}
              {index !== menuSections.length - 1 && (
                <Divider sx={{ my: 1, opacity: 0.3 }} />
              )}
            </Box>
          ))}
        </Menu>


      </Toolbar>
    </AppBar>
  );
};

export default PopdownMenu;
