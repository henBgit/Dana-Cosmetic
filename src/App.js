import React, { useState, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Button,
  Box,
  Divider,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import { ThemeProvider, createTheme, rtl } from '@mui/material/styles';
import SignatureCanvas from 'react-signature-canvas';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { keyframes } from '@emotion/react';

// Animations
const dropIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-100px);
  }
  60% {
    opacity: 1;
    transform: translateY(20px);
  }
  80% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0);
  }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

function App() {
  const signatureRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // פרטים אישיים
    clientName: '',
    birthDate: '',
    phone: '',
    email: '',
    
    // מידע רפואי
    pregnant: '',
    pregnantDetails: '',
    
    // מצב העור
    skinCondition: {
      dry: false,
      oily: false,
      sensitive: false,
      normal: false,
      combination: false,
    },
    skinIssues: {
      acne: false,
      pigmentation: false,
      rosacea: false,
    },
    
    // טיפולים קוסמטיים
    previousTreatments: '',
    previousTreatmentWhere: '',
    previousTreatmentTypes: '',
    
    // תרופות ואלרגיות
    medications: '',
    allergies: '',
    chronicDiseases: '',
    
    // מידע בריאותי
    heartDisease: '',
    heartDiseaseDetails: '',
    bloodPressure: '',
    bloodPressureDetails: '',
    diabetes: '',
    diabetesDetails: '',
    epilepsy: '',
    epilepsyDetails: '',
    cancer: '',
    cancerDetails: '',
    hiv: '',
    hivDetails: '',
    bloodThinner: '',
    
    // הסכמה
    consentAgreement: false,
    signatureDate: '',
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox' && name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const clearSignature = () => {
    signatureRef.current.clear();
  };

  const fillTestData = () => {
    setFormData({
      clientName: 'מזל מועלם',
      birthDate: '1990-01-01',
      phone: '0500000000',
      email: 'test@example.com',
      pregnant: 'no',
      pregnantDetails: '',
      skinCondition: {
        dry: true,
        oily: false,
        sensitive: false,
        normal: false,
        combination: false,
      },
      skinIssues: {
        acne: true,
        pigmentation: false,
        rosacea: false,
      },
      previousTreatments: 'טיפול פנים בסיסי לפני שנה',
      previousTreatmentWhere: 'קליניקה בתל אביב, 2024',
      previousTreatmentTypes: 'פילינג עדין',
      medications: 'גלולות למניעת הריון',
      allergies: 'ללא',
      chronicDiseases: 'ללא',
      heartDisease: 'no',
      heartDiseaseDetails: 'מעשנת ים אבל',
      bloodPressure: 'no',
      bloodPressureDetails: '',
      diabetes: 'no',
      diabetesDetails: '',
      epilepsy: '',
      epilepsyDetails: '',
      cancer: '',
      cancerDetails: '',
      hiv: '',
      hivDetails: '',
      bloodThinner: 'ללא',
      consentAgreement: true,
      signatureDate: new Date().toISOString().split('T')[0],
    });
  };

  const generatePDF = async () => {
    // צלם את הטופס המלא עם איכות נמוכה יותר
    const formElement = document.getElementById('form-container');
    const canvas = await html2canvas(formElement, {
      scale: 1, // הפחתת איכות
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: formElement.scrollWidth,
      height: formElement.scrollHeight
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 0.8); // JPEG עם איכות 70%
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    return pdf;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.consentAgreement) {
      setError('יש לאשר את תנאי ההסכמה');
      return;
    }
    
    if (signatureRef.current.isEmpty()) {
      setError('יש לחתום על הטופס');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Generate PDF
      const pdf = await generatePDF();
      const pdfBase64 = pdf.output('datauristring').split(',')[1];
      
      // Send email using EmailJS
      // You need to replace these with your actual EmailJS credentials
      const templateParams = {
        client_name: formData.clientName,
        client_email: formData.email,
        client_phone: formData.phone,
        pdf_attachment: pdfBase64,
      };
      
      // שליחה לשרת ה-PHP שלנו
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost/untitled%20folder/send-email.php';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateParams),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'שליחת המייל נכשלה');
      }
      
      setSuccess(true);
      setLoading(false);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          clientName: '',
          birthDate: '',
          phone: '',
          email: '',
          pregnant: '',
          pregnantDetails: '',
          skinCondition: {
            dry: false,
            oily: false,
            sensitive: false,
            normal: false,
            combination: true,
          },
          skinIssues: {
            acne: true,
            pigmentation: true,
            rosacea: true,
          },
          previousTreatments: '',
          previousTreatmentWhere: '',
          previousTreatmentTypes: '',
          medications: '',
          allergies: '',
          chronicDiseases: '',
          heartDisease: '',
          heartDiseaseDetails: '',
          bloodPressure: '',
          bloodPressureDetails: '',
          diabetes: '',
          diabetesDetails: '',
          epilepsy: '',
          epilepsyDetails: '',
          cancer: '',
          cancerDetails: '',
          hiv: '',
          hivDetails: '',
          bloodThinner: '',
          consentAgreement: false,
          signatureDate: '',
        });
        signatureRef.current.clear();
        setSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.error('Error:', err);
      setError('אירעה שגיאה בשליחת הטופס. אנא נסה שוב.');
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        mb: 5,
        animation: `${dropIn} 1s ease-out`
      }}>
        <img 
          src="/Web_Photo_Editor.jpg" 
          alt="SKINCARE SALON" 
          style={{ 
            maxHeight: '250px',
            borderRadius: '20px',
            boxShadow: '0 10px 20px rgba(240, 98, 146, 0.2)',
            marginBottom: '20px'
          }} 
        />
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            fontWeight: 'bold', 
            color: '#424242',
            textAlign: 'center',
            mb: 1
          }}
        >
          טופס בריאות
        </Typography>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            color: '#757575',
            textAlign: 'center'
          }}
        >
          אנא מלאו את הפרטים הבאים לפני הטיפול
        </Typography>
      </Box>

      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 3, md: 5 }, 
          backgroundColor: '#fff', // White paper for better contrast on pink bg
          borderRadius: 4,
          boxShadow: '0 10px 40px rgba(233, 30, 99, 0.08)',
          animation: `${fadeInUp} 0.8s ease-out 0.4s both`, // Delay execution
          border: '1px solid rgba(244, 143, 177, 0.1)'
        }} 
        id="form-container"
      >
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            הטופס נשלח בהצלחה! תודה רבה.
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
          <Button variant="outlined" size="small" onClick={fillTestData}>
            מילוי אוטומטי (בדיקות)
          </Button>
        </Box>
        
        <form onSubmit={handleSubmit}>
          {/* פרטים אישיים */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom color="secondary">
              פרטים אישיים
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="שם הלקוחה"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="תאריך לידה"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="טלפון"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="תאריך מילוי הטופס"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* מידע רפואי */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom color="secondary">
              מידע רפואי 🌸
            </Typography>
            
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel>האם את בהריון או מניקה?</FormLabel>
              <RadioGroup
                name="pregnant"
                value={formData.pregnant}
                onChange={handleInputChange}
                row
              >
                <FormControlLabel value="yes" control={<Radio />} label="כן" />
                <FormControlLabel value="no" control={<Radio />} label="לא" />
              </RadioGroup>
            </FormControl>
            
            {formData.pregnant === 'yes' && (
              <TextField
                fullWidth
                label="פרטים נוספים"
                name="pregnantDetails"
                value={formData.pregnantDetails}
                onChange={handleInputChange}
                multiline
                rows={2}
                sx={{ mb: 2 }}
              />
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* מצב העור */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom color="secondary">
              מצב העור 🌸
            </Typography>
            
            <FormControl component="fieldset">
              <FormLabel>איך היית מגדירה את סוג העור שלך?</FormLabel>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="skinCondition.dry"
                      checked={formData.skinCondition.dry}
                      onChange={handleInputChange}
                    />
                  }
                  label="יבש"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="skinCondition.oily"
                      checked={formData.skinCondition.oily}
                      onChange={handleInputChange}
                    />
                  }
                  label="שמן"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="skinCondition.sensitive"
                      checked={formData.skinCondition.sensitive}
                      onChange={handleInputChange}
                    />
                  }
                  label="רגיש"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="skinCondition.normal"
                      checked={formData.skinCondition.normal}
                      onChange={handleInputChange}
                    />
                  }
                  label="נורמלי"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="skinCondition.combination"
                      checked={formData.skinCondition.combination}
                      onChange={handleInputChange}
                    />
                  }
                  label="מעורב"
                />
              </Box>
            </FormControl>
            
            <FormControl component="fieldset" sx={{ mt: 3 }}>
              <FormLabel>בעיות עור קיימות</FormLabel>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="skinIssues.acne"
                      checked={formData.skinIssues.acne}
                      onChange={handleInputChange}
                    />
                  }
                  label="אקנה"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="skinIssues.pigmentation"
                      checked={formData.skinIssues.pigmentation}
                      onChange={handleInputChange}
                    />
                  }
                  label="פיגמנטציה"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="skinIssues.rosacea"
                      checked={formData.skinIssues.rosacea}
                      onChange={handleInputChange}
                    />
                  }
                  label="רוזציאה"
                />
              </Box>
            </FormControl>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* טיפולים קוסמטיים */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom color="secondary">
              טיפולים קוסמטיים 🌸
            </Typography>
            
            <TextField
              fullWidth
              label="האם עברת טיפולי פנים בעבר?"
              name="previousTreatments"
              value={formData.previousTreatments}
              onChange={handleInputChange}
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="איפה ומתי?"
              name="previousTreatmentWhere"
              value={formData.previousTreatmentWhere}
              onChange={handleInputChange}
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="סוגי טיפולים (פילינג, לייזר, בוטוקס, מילוי)"
              name="previousTreatmentTypes"
              value={formData.previousTreatmentTypes}
              onChange={handleInputChange}
              multiline
              rows={2}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* מידע בריאותי */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom color="secondary">
              מידע בריאותי 🌸
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="תרופות קבועות"
                  name="medications"
                  value={formData.medications}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="אלרגיות (תרופות, מזון, חומרים)"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="מחלות כרוניות"
                  name="chronicDiseases"
                  value={formData.chronicDiseases}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel>האם יש לך מחלות לב?</FormLabel>
                  <RadioGroup
                    name="heartDisease"
                    value={formData.heartDisease}
                    onChange={handleInputChange}
                    row
                  >
                    <FormControlLabel value="yes" control={<Radio />} label="כן" />
                    <FormControlLabel value="no" control={<Radio />} label="לא" />
                  </RadioGroup>
                </FormControl>
                {formData.heartDisease === 'yes' && (
                  <TextField
                    fullWidth
                    label="פרטים"
                    name="heartDiseaseDetails"
                    value={formData.heartDiseaseDetails}
                    onChange={handleInputChange}
                    sx={{ mt: 1 }}
                  />
                )}
              </Grid>
              
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel>לחץ דם גבוה או נמוך?</FormLabel>
                  <RadioGroup
                    name="bloodPressure"
                    value={formData.bloodPressure}
                    onChange={handleInputChange}
                    row
                  >
                    <FormControlLabel value="yes" control={<Radio />} label="כן" />
                    <FormControlLabel value="no" control={<Radio />} label="לא" />
                  </RadioGroup>
                </FormControl>
                {formData.bloodPressure === 'yes' && (
                  <TextField
                    fullWidth
                    label="פרטים"
                    name="bloodPressureDetails"
                    value={formData.bloodPressureDetails}
                    onChange={handleInputChange}
                    sx={{ mt: 1 }}
                  />
                )}
              </Grid>
              
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel>סוכרת?</FormLabel>
                  <RadioGroup
                    name="diabetes"
                    value={formData.diabetes}
                    onChange={handleInputChange}
                    row
                  >
                    <FormControlLabel value="yes" control={<Radio />} label="כן" />
                    <FormControlLabel value="no" control={<Radio />} label="לא" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="תרופות מדללות דם"
                  name="bloodThinner"
                  value={formData.bloodThinner}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* חתימה דיגיטלית */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom color="secondary">
              הסכמה וחתימה 🌸
            </Typography>
            
            <FormControlLabel
              control={
                <Checkbox
                  name="consentAgreement"
                  checked={formData.consentAgreement}
                  onChange={handleInputChange}
                  required
                />
              }
              label="אני מאשרת כי קראתי והבנתי את כל הפרטים בטופס זה ומסכימה לטיפול"
              sx={{ mb: 2 }}
            />
            
            <Typography variant="body2" gutterBottom>
              חתימה דיגיטלית:
            </Typography>
            
            <Box
              sx={{
                border: '2px solid',
                borderColor: 'primary.main',
                borderRadius: 1,
                mb: 2,
                backgroundColor: 'white',
              }}
            >
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  style: {
                    width: '100%',
                    height: '200px',
                  },
                }}
              />
            </Box>
            
            <Button
              variant="outlined"
              onClick={clearSignature}
              sx={{ mb: 2 }}
            >
              נקה חתימה
            </Button>
            
            <TextField
              fullWidth
              label="תאריך"
              name="signatureDate"
              type="date"
              value={formData.signatureDate}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                minWidth: 200,
                py: 1.5,
                fontSize: '1.1rem',
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'שלח טופס'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}

export default App;
