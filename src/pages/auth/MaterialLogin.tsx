// // src/pages/auth/MaterialLogin.tsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';

// // Material UI imports
// import {
//   Avatar,
//   Button,
//   CssBaseline,
//   TextField,
//   FormControlLabel,
//   Checkbox,
//   Link,
//   Paper,
//   Box,
//   Grid,
//   Typography,
//   useTheme,
//   Snackbar,
//   Alert,
//   IconButton,
//   InputAdornment,
//   CircularProgress
// } from '@mui/material';

// // Material UI Icons
// import {
//   LockOutlined,
//   Visibility,
//   VisibilityOff,
//   QrCode2 as QrCodeIcon
// } from '@mui/icons-material';

// // Types
// interface CopyrightProps {
//   sx?: React.CSSProperties;
// }

// // Copyright component
// const Copyright: React.FC<CopyrightProps> = ({ sx }) => {
//   return (
//     <Typography variant="body2" color="text.secondary" align="center" sx={sx}>
//       {'Copyright © '}
//       <Link color="inherit" href="#">
//         ISP Barcode System
//       </Link>{' '}
//       {new Date().getFullYear()}
//     </Typography>
//   );
// };

// const MaterialLogin: React.FC = () => {
//   const navigate = useNavigate();
//   const { login, loading, error: authError } = useAuth();
//   const theme = useTheme();

//   // States
//   const [credentials, setCredentials] = useState({
//     username: '',
//     password: ''
//   });
//   const [rememberMe, setRememberMe] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [showSuccessAlert, setShowSuccessAlert] = useState(false);

//   // Clear error when credentials change
//   useEffect(() => {
//     if (error) setError(null);
//   }, [credentials.username, credentials.password]);

//   // Handle input changes
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setCredentials(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   // Toggle password visibility
//   const togglePasswordVisibility = () => {
//     setShowPassword(prev => !prev);
//   };

//   // Handle form submission
//   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     setError(null);

//     if (!credentials.username.trim() || !credentials.password.trim()) {
//       setError('Username and password are required');
//       return;
//     }

//     try {
//       const success = await login(credentials.username, credentials.password);
      
//       if (success) {
//         setShowSuccessAlert(true);
//         // Store remember me preference if checked
//         if (rememberMe) {
//           localStorage.setItem('rememberUser', credentials.username);
//         } else {
//           localStorage.removeItem('rememberUser');
//         }
        
//         // Redirect to dashboard after a short delay
//         setTimeout(() => {
//           navigate('/dashboard');
//         }, 1000);
//       } else {
//         setError(authError || 'Invalid username or password');
//       }
//     } catch (err) {
//       console.error('Login error:', err);
//       setError('An unexpected error occurred. Please try again.');
//     }
//   };

//   // Check for remembered user on component mount
//   useEffect(() => {
//     const rememberedUser = localStorage.getItem('rememberUser');
//     if (rememberedUser) {
//       setCredentials(prev => ({ ...prev, username: rememberedUser }));
//       setRememberMe(true);
//     }
//   }, []);

//   // Handle alert close
//   const handleAlertClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
//     if (reason === 'clickaway') return;
//     setShowSuccessAlert(false);
//   };

//   return (
//     <Grid container component="main" sx={{ height: '100vh' }}>
//       <CssBaseline />
      
//       {/* Left side - Brand Image */}
//       <Grid
//         item
//         xs={false}
//         sm={4}
//         md={7}
//         sx={{
//           backgroundImage: 'url(https://source.unsplash.com/random?datacenter)',
//           backgroundRepeat: 'no-repeat',
//           backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
//           backgroundSize: 'cover',
//           backgroundPosition: 'center',
//           position: 'relative',
//         }}
//       >
//         {/* Overlay with brand info */}
//         <Box
//           sx={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             backgroundColor: 'rgba(0, 0, 0, 0.6)',
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//             justifyContent: 'center',
//             padding: 4,
//           }}
//         >
//           <QrCodeIcon sx={{ color: 'white', fontSize: 80, mb: 3 }} />
//           <Typography component="h1" variant="h3" color="white" gutterBottom>
//             ISP Barcode System
//           </Typography>
//           <Typography variant="h6" color="white" align="center" sx={{ maxWidth: 500 }}>
//             Streamline your inventory management with our advanced barcode tracking solution
//           </Typography>
//         </Box>
//       </Grid>
      
//       {/* Right side - Login form */}
//       <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
//         <Box
//           sx={{
//             my: 8,
//             mx: 4,
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//           }}
//         >
//           <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
//             <LockOutlined />
//           </Avatar>
//           <Typography component="h1" variant="h5">
//             Sign in
//           </Typography>
          
//           <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
//             <TextField
//               margin="normal"
//               required
//               fullWidth
//               id="username"
//               label="Username"
//               name="username"
//               autoComplete="username"
//               autoFocus={!credentials.username}
//               value={credentials.username}
//               onChange={handleInputChange}
//               error={!!error}
//               inputProps={{ 'aria-label': 'Username' }}
//             />
            
//             <TextField
//               margin="normal"
//               required
//               fullWidth
//               name="password"
//               label="Password"
//               type={showPassword ? 'text' : 'password'}
//               id="password"
//               autoComplete="current-password"
//               value={credentials.password}
//               onChange={handleInputChange}
//               error={!!error}
//               helperText={error}
//               InputProps={{
//                 endAdornment: (
//                   <InputAdornment position="end">
//                     <IconButton
//                       aria-label="toggle password visibility"
//                       onClick={togglePasswordVisibility}
//                       edge="end"
//                     >
//                       {showPassword ? <VisibilityOff /> : <Visibility />}
//                     </IconButton>
//                   </InputAdornment>
//                 ),
//               }}
//               inputProps={{ 'aria-label': 'Password' }}
//             />
            
//             <FormControlLabel
//               control={
//                 <Checkbox 
//                   id="remember-me"
//                   value="remember" 
//                   color="primary" 
//                   checked={rememberMe}
//                   onChange={(e) => setRememberMe(e.target.checked)}
//                   inputProps={{ 'aria-label': 'Remember me checkbox' }}
//                 />
//               }
//               label="Remember me"
//             />
            
//             <Button
//               type="submit"
//               fullWidth
//               variant="contained"
//               sx={{ mt: 3, mb: 2, py: 1.5 }}
//               disabled={loading}
//               startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
//               aria-label="Sign in"
//             >
//               {loading ? 'Signing in...' : 'Sign In'}
//             </Button>
            
//             <Grid container spacing={2}>
//               <Grid item xs={12} sm={6}>
//                 <Link href="#" variant="body2" underline="hover">
//                   Forgot password?
//                 </Link>
//               </Grid>
//               <Grid item xs={12} sm={6} sx={{ textAlign: { sm: 'right' } }}>
//                 <Link href="#" variant="body2" underline="hover">
//                   {"Need help? Contact admin"}
//                 </Link>
//               </Grid>
//             </Grid>
            
//             <Box sx={{ mt: 5, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
//               <Typography variant="subtitle2" color="text.secondary" gutterBottom>
//                 Demo Credentials
//               </Typography>
//               <Typography variant="body2" gutterBottom>
//                 Username: <strong>admin</strong>
//               </Typography>
//               <Typography variant="body2">
//                 Password: <strong>admin123</strong>
//               </Typography>
//             </Box>
            
//             <Copyright sx={{ mt: 5 }} />
//           </Box>
//         </Box>
//       </Grid>
      
//       {/* Success Alert */}
//       <Snackbar 
//         open={showSuccessAlert} 
//         autoHideDuration={6000} 
//         onClose={handleAlertClose}
//         anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//       >
//         <Alert 
//           onClose={handleAlertClose} 
//           severity="success" 
//           sx={{ width: '100%' }}
//           variant="filled"
//         >
//           Login successful! Redirecting...
//         </Alert>
//       </Snackbar>
//     </Grid>
//   );
// };

// export default MaterialLogin;