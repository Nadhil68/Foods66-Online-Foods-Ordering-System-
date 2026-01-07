import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { User } from '../types';
import { MapPin, User as UserIcon, Phone, Mail, Lock, CheckCircle, Loader, Activity, Eye, EyeOff, Navigation, Check, ChevronDown, RefreshCw, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { validateHealthProfile } from '../services/geminiService';

const Register: React.FC = () => {
  const { registerUser, showNotification } = useAppContext();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState<User>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    address: {
      doorNo: '',
      landmark: '',
      district: '',
      state: '',
      pincode: '',
      lat: 13.0827, // Default Chennai
      lng: 80.2707
    },
    healthProfile: {
      hasIssues: false,
      diseaseName: '',
      stage: '1',
      medicines: '',
      age: undefined,
      dietaryMemo: ''
    }
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Password Visibility & Validation
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false
  });

  // Country Code State
  const [countryCode, setCountryCode] = useState('+91');

  // CAPTCHA State
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Location State
  const [locationLoading, setLocationLoading] = useState(false);
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  // Health Validation State
  const [isVerifyingHealth, setIsVerifyingHealth] = useState(false);
  const [validationResult, setValidationResult] = useState<{valid: boolean, reason?: string, memo?: string} | null>(null);

  // --- Real-time Password Validation ---
  useEffect(() => {
    const pwd = formData.password || '';
    setPasswordCriteria({
      length: pwd.length >= 8,
      hasUpper: /[A-Z]/.test(pwd),
      hasLower: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    });
  }, [formData.password]);

  const passwordScore = Object.values(passwordCriteria).filter(Boolean).length;

  const getPasswordStrengthColor = () => {
    if (passwordScore <= 2) return 'bg-red-500';
    if (passwordScore <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordScore === 0) return '';
    if (passwordScore <= 2) return 'Weak';
    if (passwordScore <= 4) return 'Medium';
    return 'Strong';
  };

  // --- CAPTCHA Logic ---
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput(''); 
    
    // Defer drawing to ensure state update doesn't conflict or canvas is ready
    setTimeout(() => drawCaptcha(code), 0);
  };

  const drawCaptcha = (code: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background
    ctx.fillStyle = '#f3f4f6'; // gray-100
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add Noise (Lines)
    for(let i=0; i<7; i++) {
        ctx.strokeStyle = `rgba(0,0,0,${0.1 + Math.random() * 0.2})`;
        ctx.lineWidth = 1 + Math.random();
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
    }

    // Add Noise (Dots)
    for(let i=0; i<30; i++) {
        ctx.fillStyle = `rgba(0,0,0,${0.1 + Math.random() * 0.2})`;
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Draw Text
    ctx.font = 'bold 24px "Courier New", monospace';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    
    const charWidth = canvas.width / 6;
    for (let i = 0; i < 6; i++) {
        ctx.save();
        const x = (i * charWidth) + (charWidth / 2);
        const y = canvas.height / 2;
        const angle = (Math.random() - 0.5) * 0.4; // Random rotation between -0.2 and 0.2 radians
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = '#374151'; // gray-700
        ctx.fillText(code[i], 0, 0);
        ctx.restore();
    }
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  // --- Location Logic ---
  const validateAddressField = (field: string, value: string) => {
    let error = '';
    const val = value.trim();
    switch(field) {
        case 'doorNo':
            if (!val) error = 'Door No. / Flat No. is required';
            break;
        case 'landmark':
            if (!val) error = 'Landmark is required';
            break;
        case 'district':
            if (!val) error = 'District / City is required';
            break;
        case 'state':
            if (!val) error = 'State is required';
            break;
        case 'pincode':
            if (!val) error = 'Pincode is required';
            else if (!/^\d{5,6}$/.test(val)) error = 'Enter a valid 5-6 digit pincode';
            break;
    }
    return error;
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      showNotification('Error', 'Geolocation is not supported by your browser', 'error');
      return;
    }

    setLocationLoading(true);
    
    const success = async (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();
        
        const district = data.address.city || data.address.town || data.address.district || '';
        const state = data.address.state || '';
        const pincode = data.address.postcode || '';

        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            doorNo: prev.address.doorNo, 
            landmark: prev.address.landmark, 
            district,
            state,
            pincode,
            lat: latitude,
            lng: longitude
          }
        }));

        setAddressErrors(prev => ({
            ...prev,
            district: '',
            state: '',
            pincode: ''
        }));

        showNotification('Location Found', 'Address details updated from GPS', 'success');
      } catch (error) {
        console.error("Geocoding failed", error);
        showNotification('Error', 'Failed to fetch address details from coordinates', 'error');
      } finally {
        setLocationLoading(false);
      }
    };

    const error = () => {
      setLocationLoading(false);
      showNotification('Permission Denied', 'Please allow location access or enter address manually', 'warning');
    };

    navigator.geolocation.getCurrentPosition(success, error);
  };

  const geocodeAddress = async () => {
      const { district, state, pincode } = formData.address;
      if (!district && !pincode) return;

      const query = `${district}, ${state}, ${pincode}`;
      try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
          const data = await response.json();
          if (data && data.length > 0) {
              setFormData(prev => ({
                  ...prev,
                  address: {
                      ...prev.address,
                      lat: parseFloat(data[0].lat),
                      lng: parseFloat(data[0].lon)
                  }
              }));
          }
      } catch (e) {
          console.warn("Forward geocoding failed", e);
      }
  };

  // --- Form Handling ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Reset validation when health fields change
    if (name.startsWith('health_')) {
        setValidationResult(null);
    }

    if (name.startsWith('addr_')) {
      const field = name.replace('addr_', '');
      setFormData(prev => ({ ...prev, address: { ...prev.address, [field]: value } }));
      const error = validateAddressField(field, value);
      setAddressErrors(prev => ({ ...prev, [field]: error }));
    } else if (name.startsWith('health_')) {
      const field = name.replace('health_', '');
      if (field === 'age') {
        const numVal = value ? parseInt(value) : undefined;
        setFormData(prev => ({ ...prev, healthProfile: { ...prev.healthProfile, age: isNaN(numVal as number) ? undefined : numVal } }));
      } else {
        setFormData(prev => ({ ...prev, healthProfile: { ...prev.healthProfile, [field]: value } }));
      }
    } else if (name === 'hasIssues') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, healthProfile: { ...prev.healthProfile, hasIssues: checked } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
       if (!formData.firstName || !formData.username || !formData.email || !formData.password || !formData.phone) {
           showNotification('Missing Fields', 'Please fill in all personal details', 'warning');
           return;
       }
       
       if (passwordScore < 5) {
           showNotification('Weak Password', 'Please meet all password requirements.', 'warning');
           return;
       }
       if (formData.password !== confirmPassword) {
           showNotification('Password Mismatch', 'Passwords do not match', 'error');
           return;
       }

       const phoneDigits = formData.phone.replace(/\D/g, ''); 
       if (phoneDigits.length < 8) {
           showNotification('Invalid Phone', 'Please enter a valid phone number.', 'warning');
           return;
       }

       if (!captchaInput || captchaInput.toUpperCase() !== captchaCode) {
           showNotification('Verification Failed', 'Incorrect CAPTCHA code.', 'error');
           generateCaptcha(); 
           return;
       }

       setStep(2);
    } else if (step === 2) {
       const errors: Record<string, string> = {};
       let hasError = false;
       ['doorNo', 'landmark', 'district', 'state', 'pincode'].forEach(field => {
           const val = formData.address[field as keyof typeof formData.address] as string || '';
           const error = validateAddressField(field, val);
           if (error) {
               errors[field] = error;
               hasError = true;
           }
       });
       setAddressErrors(errors);
       if (hasError) {
           showNotification('Invalid Address', 'Please correct the errors.', 'error');
           return;
       }
       if (!formData.address.lat || formData.address.lat === 13.0827) {
           geocodeAddress();
       }
       setStep(3);
    }
  };

  const handleVerifyProfile = async () => {
       const { age, diseaseName, stage, medicines } = formData.healthProfile;
       if (!age) { showNotification('Incomplete', 'Enter Age', 'warning'); return; }
       if (!diseaseName) { showNotification('Incomplete', 'Enter Condition', 'warning'); return; }
       
       setIsVerifyingHealth(true);
       try {
           const result = await validateHealthProfile(diseaseName, stage || '1', medicines || 'None', age);
           setValidationResult({ valid: result.valid, reason: result.reason, memo: result.dietaryMemo });
           
           if (result.valid) {
               // Auto save memo to form state
               setFormData(prev => ({
                   ...prev,
                   healthProfile: { ...prev.healthProfile, dietaryMemo: result.dietaryMemo }
               }));
               showNotification('Verified', 'Health profile analyzed successfully.', 'success');
           } else {
               showNotification('Invalid Profile', result.reason || 'Details do not match.', 'error');
           }
       } catch (e) {
           showNotification('Error', 'AI Service Unavailable', 'error');
       } finally {
           setIsVerifyingHealth(false);
       }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // If health issues exist but not verified, force verification first
    if (formData.healthProfile.hasIssues && !validationResult?.valid) {
        showNotification('Action Required', 'Please analyze your health profile first.', 'warning');
        setIsLoading(false);
        return;
    }

    const success = registerUser(formData);
    if (success) {
      // Per user request: Register -> Gather Info -> Sign In -> Menu
      // We are redirecting to Sign In (Login) page instead of menu directly
      // Passing state so Login page can show a success message
      navigate('/', { state: { registered: true, username: formData.username } });
    } else {
      setIsLoading(false);
    }
  };

  const renderPasswordRequirement = (met: boolean, text: string) => (
    <div className={`flex items-center text-xs transition-colors duration-200 ${met ? 'text-green-600' : 'text-gray-400'}`}>
      <div className={`w-3 h-3 rounded-full mr-1.5 flex items-center justify-center border ${met ? 'bg-green-100 border-green-500' : 'bg-gray-100 border-gray-300'}`}>
        {met && <Check size={8} />}
      </div>
      {text}
    </div>
  );

  return (
    <div 
      className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&q=80')" }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Join <span className="text-orange-500">FOODS66</span>
          </h2>
          <p className="mt-2 text-gray-200">
             Your personalized health-focused food journey starts here.
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-md py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/20">
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-orange-600' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-orange-600' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
          </div>

          <form onSubmit={handleSubmit}>
            
            {/* --- STEP 1: Account Details --- */}
            {step === 1 && (
              <div className="space-y-4 animate-fadeIn">
                 {/* ... (Previous Step 1 Content: Name, Email, Password, Phone, Captcha) ... */}
                 {/* Re-using existing UI logic for Step 1 for brevity, assumed unchanged except imports */}
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700">First Name</label>
                      <input type="text" name="firstName" required value={formData.firstName} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-lg p-2.5 bg-gray-50 border" placeholder="John" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700">Last Name</label>
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-lg p-2.5 bg-gray-50 border" placeholder="Doe" />
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700">Username</label>
                    <input type="text" name="username" required value={formData.username} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-lg p-2.5 bg-gray-50 border" placeholder="user123" />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700">Email</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-lg p-2.5 bg-gray-50 border" placeholder="mail@example.com" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-bold text-gray-700">Password</label>
                      <input type="password" name="password" required value={formData.password} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-lg p-2.5 bg-gray-50 border" placeholder="••••••" />
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-gray-700">Confirm</label>
                      <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-lg p-2.5 bg-gray-50 border" placeholder="••••••" />
                   </div>
                 </div>
                 <div className="bg-gray-50 p-2 rounded text-xs border">
                    {renderPasswordRequirement(passwordCriteria.length, "8+ chars")}
                    {renderPasswordRequirement(passwordCriteria.hasUpper, "Uppercase")}
                    {renderPasswordRequirement(passwordCriteria.hasNumber, "Number")}
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700">Phone</label>
                    <div className="flex mt-1">
                      <div className="flex items-center justify-center px-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-100 text-gray-500 font-bold sm:text-sm select-none">
                        +91
                      </div>
                      <input 
                        type="tel" 
                        name="phone" 
                        required 
                        value={formData.phone} 
                        onChange={handleInputChange} 
                        className="block w-full border-gray-300 rounded-r-lg p-2.5 bg-gray-50 border focus:ring-orange-500 focus:border-orange-500" 
                        placeholder="9876543210" 
                        maxLength={10}
                      />
                    </div>
                 </div>
                 
                 <div className="pt-2 border-t mt-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                        <ShieldCheck size={16} className="mr-1 text-orange-600"/> Human Verification
                    </label>
                    <div className="flex gap-2">
                       <div className="bg-gray-200 w-32 h-10 rounded overflow-hidden">
                          <canvas ref={canvasRef} width="128" height="40" className="w-full h-full"></canvas>
                       </div>
                       <button type="button" onClick={generateCaptcha} className="p-2 bg-gray-100 rounded hover:bg-gray-200"><RefreshCw size={16}/></button>
                       <input type="text" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} className="flex-1 border rounded p-2 uppercase font-mono tracking-widest text-center" placeholder="CODE" maxLength={6} />
                    </div>
                 </div>

                 <button type="button" onClick={handleNextStep} className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition mt-4 shadow-md">
                    Next: Address Details
                 </button>
              </div>
            )}

            {/* --- STEP 2: Address --- */}
            {step === 2 && (
              <div className="space-y-4 animate-slideInRight">
                {/* Re-using logic, abbreviated for clarity */}
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 flex items-center gap-3">
                   <Navigation size={20} className="text-orange-600" />
                   <span className="text-sm font-bold text-orange-900">Delivery Location</span>
                </div>
                <div>
                   <input type="text" name="addr_doorNo" required value={formData.address.doorNo} onChange={handleInputChange} className="w-full border rounded p-2.5 bg-gray-50" placeholder="Door No." />
                   {addressErrors.doorNo && <p className="text-xs text-red-500">{addressErrors.doorNo}</p>}
                </div>
                <div>
                   <input type="text" name="addr_landmark" value={formData.address.landmark} onChange={handleInputChange} className="w-full border rounded p-2.5 bg-gray-50" placeholder="Landmark" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <input type="text" name="addr_district" required value={formData.address.district} onChange={handleInputChange} className="w-full border rounded p-2.5 bg-gray-50" placeholder="City" />
                   <input type="text" name="addr_pincode" required value={formData.address.pincode} onChange={handleInputChange} className="w-full border rounded p-2.5 bg-gray-50" placeholder="Pincode" />
                </div>
                <div>
                   <input type="text" name="addr_state" required value={formData.address.state} onChange={handleInputChange} className="w-full border rounded p-2.5 bg-gray-50" placeholder="State" />
                </div>
                <button type="button" onClick={handleGetLocation} className="w-full py-2 border-2 border-orange-500 text-orange-600 rounded-lg font-bold flex justify-center items-center gap-2">
                  {locationLoading ? <Loader size={16} className="animate-spin" /> : <MapPin size={16} />} Use Current Location
                </button>
                <div className="flex gap-4 mt-6">
                  <button type="button" onClick={() => setStep(1)} className="w-1/2 bg-gray-300 text-gray-700 py-3 rounded-lg font-bold">Back</button>
                  <button type="button" onClick={handleNextStep} className="w-1/2 bg-orange-600 text-white py-3 rounded-lg font-bold">Next</button>
                </div>
              </div>
            )}

            {/* --- STEP 3: Health Profile (Enhanced) --- */}
            {step === 3 && (
              <div className="space-y-6 animate-slideInRight">
                 <div className="text-center">
                    <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                       <Activity size={32} className="text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Disease Verification</h3>
                    <p className="text-sm text-gray-500">Analyze your condition to get accurate recommendations.</p>
                 </div>

                 <div className="bg-white p-4 rounded-xl border-2 border-orange-100 shadow-sm">
                    <label className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                      <input 
                        type="checkbox" 
                        name="hasIssues" 
                        checked={formData.healthProfile.hasIssues} 
                        onChange={handleInputChange} 
                        className="w-6 h-6 text-orange-600 rounded focus:ring-orange-500 border-gray-300" 
                      />
                      <span className="ml-3 font-bold text-gray-800">I have specific health concerns</span>
                    </label>

                    {formData.healthProfile.hasIssues && (
                      <div className="mt-4 space-y-4 pl-2 border-l-2 border-orange-200 ml-3 animate-fadeIn">
                        
                        <div>
                           <label className="block text-sm font-bold text-gray-700">Age</label>
                           <input type="number" name="health_age" value={formData.healthProfile.age || ''} onChange={handleInputChange} placeholder="e.g. 30" className="mt-1 block w-full border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:ring-orange-500" min="1" max="120" />
                        </div>

                        <div>
                           <label className="block text-sm font-bold text-gray-700">Condition / Disease</label>
                           <input type="text" name="health_diseaseName" value={formData.healthProfile.diseaseName} onChange={handleInputChange} placeholder="e.g. Diabetes Type 2" className="mt-1 block w-full border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:ring-orange-500" />
                        </div>

                        <div>
                           <label className="block text-sm font-bold text-gray-700">Stage / Severity</label>
                           <select name="health_stage" value={formData.healthProfile.stage} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:ring-orange-500">
                             <option value="1">Stage 1 - Beginning / Mild</option>
                             <option value="2">Stage 2 - Intermediate / Moderate</option>
                             <option value="3">Stage 3 - Advanced / Severe</option>
                           </select>
                        </div>

                        <div>
                           <label className="block text-sm font-bold text-gray-700">Medications Taking</label>
                           <textarea name="health_medicines" value={formData.healthProfile.medicines} onChange={handleInputChange} placeholder="List medicines..." className="mt-1 block w-full border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:ring-orange-500 h-20 resize-none" />
                        </div>

                        {/* Analyze Button */}
                        {!validationResult?.valid && (
                            <button 
                                type="button" 
                                onClick={handleVerifyProfile}
                                disabled={isVerifyingHealth}
                                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition flex justify-center items-center shadow-md mt-2"
                            >
                                {isVerifyingHealth ? <Loader size={18} className="animate-spin mr-2"/> : <Sparkles size={18} className="mr-2" />}
                                {isVerifyingHealth ? 'Analyzing Profile...' : 'Analyze Health Profile'}
                            </button>
                        )}
                      </div>
                    )}
                 </div>

                {/* Validation Result Display */}
                {validationResult && formData.healthProfile.hasIssues && (
                   <div className={`p-4 rounded-xl border-l-4 shadow-sm animate-fadeIn ${validationResult.valid ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                      <div className="flex items-start gap-3">
                          {validationResult.valid ? <CheckCircle className="text-green-600 mt-1" size={20} /> : <AlertCircle className="text-red-600 mt-1" size={20} />}
                          <div>
                              <h4 className={`font-bold ${validationResult.valid ? 'text-green-800' : 'text-red-800'}`}>
                                  {validationResult.valid ? 'Profile Verified' : 'Verification Failed'}
                              </h4>
                              {validationResult.valid && validationResult.memo && (
                                  <div className="mt-2 text-sm text-green-700 bg-white/60 p-2 rounded border border-green-100">
                                      <span className="font-bold uppercase text-xs block text-green-600 mb-1">Dietary Prescription:</span>
                                      "{validationResult.memo}"
                                  </div>
                              )}
                              {!validationResult.valid && (
                                  <p className="text-sm text-red-700 mt-1">{validationResult.reason}</p>
                              )}
                          </div>
                      </div>
                   </div>
                )}

                <div className="flex gap-4 mt-6">
                  <button type="button" onClick={() => setStep(2)} className="w-1/2 bg-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-400 transition" disabled={isVerifyingHealth}>Back</button>
                  <button 
                    type="submit" 
                    disabled={isVerifyingHealth || isLoading || (formData.healthProfile.hasIssues && !validationResult?.valid)}
                    className={`w-1/2 bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition flex justify-center items-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isLoading ? <Loader size={20} className="animate-spin" /> : 'Complete Registration'}
                  </button>
                </div>
              </div>
            )}
            
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/" className="font-bold text-orange-600 hover:text-orange-500">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;