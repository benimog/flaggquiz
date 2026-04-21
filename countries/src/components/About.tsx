import React from "react";
import { Link as RouterLink } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import { useTranslation } from "react-i18next";

function About() {
  const { t } = useTranslation();
  return (
    <Box sx={{ maxWidth: 600, mx: "auto", px: 2, pb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t("pages.about.welcome")}
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t("pages.about.gameModesHeading")}
        </Typography>
        <Typography variant="body1" component="div">
          <ul style={{ paddingLeft: "1.2em", margin: 0 }}>
            <li>
              <Link component={RouterLink} to="/" color="primary">
                {t("pages.about.modes.flagquiz")}
              </Link>{" "}
              — {t("pages.about.modes.flagquizDesc")}
            </li>
            <li>
              <Link component={RouterLink} to="/flaggor" color="primary">
                {t("pages.about.modes.flagquizAll")}
              </Link>{" "}
              — {t("pages.about.modes.flagquizAllDesc")}
            </li>
            <li>
              <Link component={RouterLink} to="/skriv" color="primary">
                {t("pages.about.modes.writeMode")}
              </Link>{" "}
              — {t("pages.about.modes.writeModeDesc")}
            </li>
            <li>
              <Link component={RouterLink} to="/daglig" color="primary">
                {t("pages.about.modes.daily")}
              </Link>{" "}
              — {t("pages.about.modes.dailyDesc")}
            </li>
            <li>
              <Link component={RouterLink} to="/varldsdelar" color="primary">
                {t("pages.about.modes.continent")}
              </Link>{" "}
              — {t("pages.about.modes.continentDesc")}
            </li>
            <li>
              <Link component={RouterLink} to="/varldskarta" color="primary">
                {t("pages.about.modes.worldMap")}
              </Link>{" "}
              — {t("pages.about.modes.worldMapDesc")}
            </li>
            <li>
              <Link component={RouterLink} to="/varldskarta/regioner" color="primary">
                {t("pages.about.modes.regionMap")}
              </Link>{" "}
              — {t("pages.about.modes.regionMapDesc")}
            </li>
            <li>
              <Link component={RouterLink} to="/landskap" color="primary">
                {t("pages.about.modes.provinces")}
              </Link>{" "}
              — {t("pages.about.modes.provincesDesc")}
            </li>
            <li>
              <Link component={RouterLink} to="/stater" color="primary">
                {t("pages.about.modes.usStates")}
              </Link>{" "}
              — {t("pages.about.modes.usStatesDesc")}
            </li>
            <li>
              <Link component={RouterLink} to="/lander" color="primary">
                {t("pages.about.modes.countries")}
              </Link>{" "}
              — {t("pages.about.modes.countriesDesc")}
            </li>
          </ul>
        </Typography>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t("pages.about.keyboardHeading")}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {t("pages.about.keyboardIntro")}
        </Typography>
        <Box sx={{ textAlign: "center", my: 2 }}>
          <img
            src="/numpad.png"
            alt={t("pages.about.keyboardAlt")}
            style={{ maxWidth: "200px", width: "100%", height: "auto" }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          {t("pages.about.keyboardCaption")}
        </Typography>
      </Paper>

      <Box sx={{ textAlign: "center", mt: 4, opacity: 0.7 }}>
        <Typography variant="body2">
          {t("pages.about.createdBy")}{" "}
          <Link
            href="https://erikmartinandersson.se/"
            target="_blank"
            rel="noreferrer"
            color="primary"
          >
            Martin
          </Link>
          {" "}{t("pages.about.withFlagsFrom")}{" "}
          <Link
            href="https://flagcdn.com/"
            target="_blank"
            rel="noreferrer"
            color="primary"
          >
            flagcdn
          </Link>
          {" "}| {" "}
          <Link
            href="https://github.com/benimog/flaggquiz"
            target="_blank"
            rel="noreferrer"
            color="primary"
          >
            GitHub
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}

export default About;
