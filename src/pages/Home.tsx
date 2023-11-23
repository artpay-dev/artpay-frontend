import React, { ReactNode } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  Paper,
  RadioGroup,
  SvgIconProps,
  Typography,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import TextField from "../components/TextField.tsx";
import PasswordField from "../components/PasswordField.tsx";
import RadioButton from "../components/RadioButton.tsx";
import Checkbox from "../components/Checkbox.tsx";
import LinkButton from "../components/LinkButton.tsx";
import CheckboxIcon from "../components/icons/CheckboxIcon.tsx";
import CheckIcon from "../components/icons/CheckIcon.tsx";
import ErrorIcon from "../components/icons/ErrorIcon.tsx";
import RadioIcon from "../components/icons/RadioIcon.tsx";
import SearchIcon from "../components/icons/SearchIcon.tsx";
import ShowIcon from "../components/icons/ShowIcon.tsx";
import HideIcon from "../components/icons/HideIcon.tsx";
import UserIcon from "../components/icons/UserIcon.tsx";
import FavouriteIcon from "../components/icons/FavouriteIcon.tsx";
import FavouriteFilledIcon from "../components/icons/FavouriteFilledIcon.tsx";
import MenuIcon from "../components/icons/MenuIcon.tsx";
import CloseIcon from "../components/icons/CloseIcon.tsx";
import PlusCircleIcon from "../components/icons/PlusCircleIcon.tsx";
import CheckFillIcon from "../components/icons/CheckFillIcon.tsx";
import QrCodeIcon from "../components/icons/QrCodeIcon.tsx";
import GoogleIcon from "../components/icons/GoogleIcon.tsx";
import AppleIcon from "../components/icons/AppleIcon.tsx";
import FacebookIcon from "../components/icons/FacebookIcon.tsx";
import ArtworkCard from "../components/ArtworkCard.tsx";
import ArtistCard from "../components/ArtistCard.tsx";
export interface HomeProps {}

type IconColor = SvgIconProps["color"];
const ShowcaseBox = ({
  children,
  title,
  md,
}: {
  children: ReactNode;
  title?: string;
  md?: number;
}) => {
  return (
    <Grid item sm={12} md={md || 6} p={2}>
      <Paper
        elevation={1}
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          height: "100%",
        }}>
        {title && (
          <>
            <span style={{ color: "grey", fontSize: "1em" }}>{title}</span>
            <Divider></Divider>
          </>
        )}
        {children}
      </Paper>
    </Grid>
  );
};

type InputVariant = "standard" | "outlined" | "filled";
const Home: React.FC<HomeProps> = ({}) => {
  const inputVariants: InputVariant[] = ["standard", "outlined"];
  return (
    <DefaultLayout>
      <Grid container spacing={2} mt={12} px={2}>
        <ShowcaseBox md={12} title="headings">
          <Typography variant="h1">Display XXL</Typography>
          <Typography variant="h1">Display XL</Typography>
          <Typography variant="h1">Display L</Typography>
        </ShowcaseBox>
        <ShowcaseBox title="headings">
          <Typography variant="h1">Heading 1</Typography>
          <Typography variant="h2">Heading 2</Typography>
          <Typography variant="h3">Heading 3</Typography>
          <Typography variant="h4">Heading 4</Typography>
          <Typography variant="h5">Heading 5</Typography>
          <Typography variant="h6">Heading 6</Typography>
        </ShowcaseBox>
        <ShowcaseBox title="headings">
          <Box display="flex" flexDirection="column">
            <Typography variant="subtitle1">UI Main Content--20</Typography>
            <Typography variant="subtitle1" fontWeight="600">
              UI Main Content--20--semibold
            </Typography>
          </Box>
          <Divider />
          <Box display="flex" flexDirection="column">
            <Typography variant="body1">UI Main Content--16</Typography>
            <Typography variant="body2">UI Main Content--14</Typography>
            <Typography variant="body2" color="textSecondary">
              UI Main Content--grey--14
            </Typography>
          </Box>
          <Divider />
          <Box display="flex" flexDirection="column">
            <Typography variant="caption" textTransform="uppercase">
              overline uppercase
            </Typography>
            <Typography variant="caption">Overline</Typography>
            <Typography variant="caption" color="secondary" fontWeight="600">
              Overline semibold
            </Typography>
          </Box>
        </ShowcaseBox>
      </Grid>
      <Grid container spacing={2} mt={2} px={2}>
        <ShowcaseBox title="buttons">
          <Box display="flex" gap={2}>
            <Button variant="contained" color="primary">
              Primary
            </Button>
            <Button variant="contained" color="secondary">
              Secondary
            </Button>
          </Box>
          <Box display="flex" gap={2}>
            <Button variant="contained" color="primary">
              Contained
            </Button>
            <Button variant="outlined" color="primary">
              Outlined
            </Button>
            <Button variant="text" color="primary">
              Text button
            </Button>
            <LinkButton>Link button</LinkButton>
          </Box>
          <Box display="flex" gap={2}>
            <Button variant="contained" color="primary" startIcon={<Add />}>
              Icon contained
            </Button>
            <Button variant="outlined" color="primary" startIcon={<Add />}>
              Icon outlined
            </Button>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <Button variant="contained" color="primary" size="small">
              Small
            </Button>
            <Button variant="contained" color="secondary">
              Medium
            </Button>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton color="primary" size="small">
              <Add />
            </IconButton>
            <IconButton color="primary" variant="outlined" size="small">
              <Add />
            </IconButton>
            <IconButton color="primary" variant="contained" size="small">
              <Add />
            </IconButton>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              color="primary"
              disabled
              startIcon={<Add />}>
              Disabled contained
            </Button>
            <Button
              variant="outlined"
              color="primary"
              disabled
              startIcon={<Add />}>
              Disabled outlined
            </Button>
          </Box>
        </ShowcaseBox>
        <ShowcaseBox title="Radio" md={3}>
          <RadioGroup defaultValue="selected" name="radio-buttons-group">
            <RadioButton value="radio" label="Radio" />
            <RadioButton value="selected" label="Selected" />
          </RadioGroup>
          <RadioGroup defaultValue="selected" name="radio-buttons-group">
            <RadioButton disabled value="radio" label="Disable" />
            <RadioButton disabled value="selected" label="Disable Selected" />
          </RadioGroup>
        </ShowcaseBox>
        <ShowcaseBox title="Checkboxes" md={3}>
          <Box display="flex" flexDirection="column" gap={0}>
            <Checkbox label="Checkbox" />
            <Checkbox defaultChecked label="Checked" />
            <Checkbox disabled label="Disabled" />
            <Checkbox disabled defaultChecked label="Checked disabled" />
          </Box>
          <Box display="flex" flexDirection="column" mt={1}>
            <Checkbox size="small" label="Small" />
            <Checkbox size="small" defaultChecked label="Checked small" />
          </Box>
        </ShowcaseBox>
        <ShowcaseBox title="Icons" md={9}>
          {(
            [
              "inherit",
              "primary",
              "secondary",
              "error",
              "success",
            ] as IconColor[]
          ).map((color, index) => (
            <Box display="flex" key={index} flexDirection="row" gap={1}>
              <CheckIcon color={color} />
              <ErrorIcon color={color} />
              <HideIcon color={color} />
              <SearchIcon color={color} />
              <ShowIcon color={color} />
              <UserIcon color={color} />
              <FavouriteIcon color={color} />
              <FavouriteFilledIcon color={color} />
              <CloseIcon color={color} />
              <MenuIcon color={color} />
              <PlusCircleIcon color={color} />
              <CheckFillIcon color={color} />
              <QrCodeIcon color={color} />
              <AppleIcon color={color} />
              <GoogleIcon color={color} />
              <FacebookIcon color={color} />
            </Box>
          ))}
        </ShowcaseBox>
        <ShowcaseBox title="Control icons" md={3}>
          {(
            [
              "inherit",
              "primary",
              "secondary",
              "error",
              "success",
            ] as IconColor[]
          ).map((color, index) => (
            <Box display="flex" key={index} flexDirection="row" gap={1}>
              <CheckboxIcon color={color} />
              <CheckboxIcon color={color} disabled />
              <CheckboxIcon color={color} checked />
              <CheckboxIcon color={color} checked disabled />
              <RadioIcon color={color} />
              <RadioIcon color={color} disabled />
              <RadioIcon color={color} checked />
              <RadioIcon color={color} checked disabled />
            </Box>
          ))}
        </ShowcaseBox>
        <ShowcaseBox title="Input" md={9}>
          {inputVariants.map((variant) => (
            <>
              <Box>
                <span
                  style={{ color: "grey", fontSize: "1em", fontWeight: "500" }}>
                  {variant}
                </span>
              </Box>
              <Box display="flex" gap={2}>
                <TextField label="Input" variant={variant} />
                <TextField label="Disabled" variant={variant} disabled />
              </Box>
              <Box display="flex" gap={2}>
                <TextField label="Error" variant={variant} error />
                <TextField
                  label="Error"
                  defaultValue="Error"
                  variant={variant}
                  error
                />
                <TextField label="Success" variant={variant} color="success" />
              </Box>
              <Box display="flex" gap={2}>
                <PasswordField variant={variant} defaultValue="Password" />
                <PasswordField
                  variant={variant}
                  defaultValue="Password visibile"
                  defaultVisible
                />
                <PasswordField
                  variant={variant}
                  helperText="Password con errore"
                  error
                />
              </Box>
            </>
          ))}
        </ShowcaseBox>
        <ShowcaseBox title="Chips" md={3}>
          <Box display="flex" flexDirection="row" gap={1}>
            <Chip label="Chip" />
            <Chip label="Primary" color="primary" />
            <Chip label="Secondary" color="secondary" />
          </Box>
          <Box display="flex" flexDirection="row" gap={1}>
            <Chip label="Outlined" variant="outlined" />
            <Chip label="Primary" color="primary" variant="outlined" />
            <Chip label="Secondary" color="secondary" variant="outlined" />
          </Box>
          <Box display="flex" flexDirection="row" gap={1} mt={0}>
            <Chip label="Error" color="error" />
            <Chip label="Success" color="success" />
            <Chip label="Info" color="info" />
          </Box>
          <Divider />
          <Box display="flex" flexDirection="row" gap={1}>
            <Chip label="Small" size="small" />
            <Chip label="Primary" color="primary" size="small" />
            <Chip label="Secondary" color="secondary" size="small" />
          </Box>
          <Box display="flex" flexDirection="row" gap={1}>
            <Chip label="Outlined" variant="outlined" size="small" />
            <Chip
              label="Primary"
              color="primary"
              variant="outlined"
              size="small"
            />
            <Chip
              label="Secondary"
              color="secondary"
              variant="outlined"
              size="small"
            />
          </Box>
          <Box display="flex" flexDirection="row" gap={1} mt={0}>
            <Chip label="Error" color="error" size="small" />
            <Chip label="Success" color="success" size="small" />
            <Chip label="Info" color="info" size="small" />
          </Box>
        </ShowcaseBox>
        <ShowcaseBox title="Cards" md={12}>
          <Box display="flex" gap={2}>
            <div>
              <ArtworkCard
                artistName="Nome dell'artista"
                title="Titolo dell’opera d’arte esposta sul sito di Artpay"
                galleryName="Nome della galleria"
                size="small"
                price={20000}
              />
            </div>
            <div>
              <ArtworkCard
                artistName="Nome dell'artista"
                title="Titolo dell’opera d’arte esposta sul sito di Artpay"
                galleryName="Nome della galleria"
                size="small"
              />
            </div>
            <div>
              <ArtworkCard
                artistName="Nome dell'artista"
                title="Titolo dell’opera d’arte esposta sul sito di Artpay"
                galleryName="Nome della galleria"
                size="medium"
                price={20000}
              />
            </div>
            <div>
              <ArtworkCard
                artistName="Nome dell'artista"
                title="Titolo dell’opera d’arte esposta sul sito di Artpay"
                size="medium"
                galleryName="Nome della galleria"
              />
            </div>
          </Box>
          <Box display="flex" gap={2}>
            <div>
              <ArtworkCard
                artistName="Nome dell'artista"
                title="Titolo dell’opera d’arte esposta sul sito di Artpay"
                galleryName="Nome della galleria"
                size="large"
                price={20000}
              />
            </div>
            <div>
              <ArtworkCard
                artistName="Nome dell'artista"
                title="Titolo dell’opera d’arte esposta sul sito di Artpay"
                size="large"
                galleryName="Nome della galleria"
              />
            </div>
          </Box>
          <Box display="flex" gap={2}>
            <div>
              <ArtistCard
                title="Nome dell'artista"
                subtitle="Torino, 1984"
                isFavourite={false}
              />
            </div>
            <div>
              <ArtistCard
                title="Nome dell'artista"
                subtitle="Torino, 1984"
                isFavourite={true}
              />
            </div>
          </Box>
        </ShowcaseBox>
      </Grid>
    </DefaultLayout>
  );
};

export default Home;
