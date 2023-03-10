import * as React from "react";
import { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import LoginIcon from "@mui/icons-material/Login";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { auth } from "../utils/firebase";
import Router, { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { authActions } from "../store/auth-slice";

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});

export default function SignIn() {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);

  const handleSubmit = async (event) => {
    event.preventDefault();
    auth
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        console.log("user authenticated!");
        router.replace("/");
        dispatch(authActions.login({ user: auth.currentUser }));
        alert("Welcome back!");
      })
      .catch((e) => alert(e.message));
  };

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center">
      <div className="border-2 border-border-gray p-8 rounded-lg space-y-2">
        <h1 className="text-3xl font-black ">Can You Diss</h1>
        <form className="flex flex-col">
          <label>E-Mail</label>
          <input
            type="email"
            className="input"
            onChange={(evt) => {
              setEmail(evt.target.value);
            }}
          />
          <label>Password</label>
          <input
            type="password"
            className="input"
            onChange={(evt) => {
              setPassword(evt.target.value);
            }}
          />
        </form>
        <div>
          <Link href="/register">
            <button className="button" onClick={handleSubmit}>
              Login
            </button>
          </Link>
        </div>

        <div>
          <p>Dont have an Account?</p>
          <Link href="/register">Register</Link>
        </div>
      </div>
    </div>
    // <ThemeProvider theme={theme}>
    //   <Container component="main" maxWidth="xs">
    //     <CssBaseline />
    //     <Box
    //       sx={{
    //         marginTop: 8,
    //         display: "flex",
    //         flexDirection: "column",
    //         alignItems: "center",
    //       }}
    //     >
    //       <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
    //         <LoginIcon />
    //       </Avatar>
    //       <Typography component="h1" variant="h5">
    //         Sign in
    //       </Typography>
    //       <Box component="div" noValidate sx={{ mt: 1 }}>
    //         <TextField
    //           margin="normal"
    //           required
    //           fullWidth
    //           id="email"
    //           label="Email Address"
    //           name="email"
    //           autoComplete="email"
    //           autoFocus
    //           onChange={(evt) => {
    //             setEmail(evt.target.value);
    //           }}
    //         />
    //         <TextField
    //           margin="normal"
    //           required
    //           fullWidth
    //           name="password"
    //           label="Password"
    //           type="password"
    //           id="password"
    //           autoComplete="current-password"
    //           onChange={(evt) => {
    //             setPassword(evt.target.value);
    //           }}
    //         />
    //         <FormControlLabel
    //           control={<Checkbox value="remember" color="primary" />}
    //           label="Remember me"
    //         />
    //         <Button
    //           type="submit"
    //           fullWidth
    //           onClick={handleSubmit}
    //           variant="outlined"
    //           sx={{ mt: 3, mb: 2 }}
    //         >
    //           Sign In
    //         </Button>
    //         <Grid container>
    //           <Grid item xs>
    //             <Link href="#" variant="body2">
    //               Forgot password?
    //             </Link>
    //           </Grid>
    //           <Grid item>
    //             <Link href="/register" variant="body2">
    //               {"Don't have an account? Sign Up"}
    //             </Link>
    //           </Grid>
    //         </Grid>
    //       </Box>
    //     </Box>
    //     <Copyright sx={{ mt: 8, mb: 4, p: 2 }} />
    //   </Container>
    // </ThemeProvider>
  );
}
