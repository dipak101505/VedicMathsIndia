import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase/config";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { sendEmailVerification } from "firebase/auth";
import {
  SignupContainer,
  FormContainer,
  HeaderSection,
  Title,
  ErrorMessage,
  Form,
  FormSection,
  FormField,
  Label,
  Input,
  Select,
  ImageSection,
  ImageContainer,
  ImagePreview,
  ImageButton,
  SubmitButton,
  LoginLink,
  StyledLink,
  RightImageContainer,
  RightImage
} from "../styles/signupPage.styles";

function SignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    batch: "",
    centres: [],
    enrollmentDate: new Date().toISOString().split("T")[0],
    class: "11",
    board: "",
    mobile: "",
    address: "",
    imageUrl: "",
    dob: "",
    school: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [centres, setCentres] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [imageButtonHovered, setImageButtonHovered] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch centres
        const centresRef = collection(db, "centres");
        const centresSnapshot = await getDocs(centresRef);
        const centresList = centresSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCentres(centresList);

        // Fetch batches
        const batchesRef = collection(db, "batches");
        const batchesSnapshot = await getDocs(batchesRef);
        const batchesList = batchesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBatches(batchesList);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const validateMobile = (mobile) => {
    return /^[0-9]{10}$/.test(mobile);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      setSelectedImage(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imagePreview: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    if (!validateMobile(formData.mobile)) {
      return setError("Please enter a valid 10-digit mobile number");
    }

    if (!formData.batch) {
      return setError("Please select a batch");
    }

    if (formData.centres.length === 0) {
      return setError("Please select at least one centre");
    }

    try {
      setError("");
      setLoading(true);

      // Upload image if selected
      let imageUrl = "";
      if (selectedImage) {
        // Create a canvas to embed text on the image
        const canvas = document.createElement("canvas");
        const img = new Image();

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = formData.imagePreview;
        });

        // Check loaded image dimensions
        if (img.width > 4000 || img.height > 4000) {
          return setError(
            "Image dimensions should be less than 4000*4000 pixels",
          );
        }

        // Set canvas dimensions to match image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image and add text
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        // Configure text style with larger font
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2; // Increased line width for better visibility
        ctx.font = "32px Arial"; // Increased font size from 20px to 32px

        // Add name and batch at the bottom of image
        const text = `${formData.name} - ${formData.batch}`;
        const textWidth = ctx.measureText(text).width;
        const x = (canvas.width - textWidth) / 2;
        const y = canvas.height - 30; // Moved up slightly to accommodate larger font

        // Draw text with stroke for better visibility
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);

        // Convert canvas to blob
        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/jpeg"),
        );

        // Upload to Firebase Storage
        const storage = getStorage();
        const imageRef = ref(
          storage,
          `student-images/${Date.now()}-${selectedImage.name}`,
        );
        await uploadBytes(imageRef, blob);
        imageUrl = await getDownloadURL(imageRef);
      }

      // Create authentication user and send verification email
      const userCredential = await signup(formData.email, formData.password);
      // Create student document with pending status
      const timestamp = new Date();
      const studentData = {
        uid: userCredential.user.uid,
        name: formData.name,
        email: formData.email,
        batch: formData.batch,
        centres: formData.centres,
        enrollmentDate: formData.enrollmentDate,
        class: formData.class,
        board: formData.board,
        mobile: formData.mobile,
        address: formData.address,
        imageUrl: imageUrl,
        dob: formData.dob,
        school: formData.school,
        createdAt: timestamp,
        updatedAt: timestamp,
        status: "pending",
        emailVerified: false,
      };

      const studentsRef = collection(db, "students");
      await addDoc(studentsRef, studentData);

      setVerificationSent(true);
      alert(
        "Please check your email to verify your account before logging in.",
      );
      navigate("/login");
      await sendEmailVerification(userCredential.user);
    } catch (err) {
      if (err.code === "auth/too-many-requests") {
        setError("Too many requests. Please try again later.");
      } else {
        setError("Failed to create account: " + err.message);
      }
    }
  };

  return (
    <SignupContainer>
      <FormContainer>
        {/* Logo and Title */}
        <HeaderSection>
          {/* <img 
            src="logo for website.png" 
            alt="Logo" 
            style={{
              width: '120px',
              height: 'auto',
              marginBottom: '0rem'
            }}
          /> */}
          <Title>Student Registration</Title>
        </HeaderSection>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Form onSubmit={handleSubmit}>
          {/* Personal Information Section */}
          <FormSection>
            <FormField>
              <Label>Full Name *</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </FormField>

            <FormField>
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </FormField>
          </FormSection>

          {/* Contact Information Section */}
          <FormSection>
            <FormField>
              <Label>Mobile Number *</Label>
              <Input
                type="tel"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
                required
                pattern="[0-9]{10}"
              />
            </FormField>

            <FormField>
              <Label>Address</Label>
              <Input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </FormField>
          </FormSection>

          {/* Academic Information Section */}
          <FormSection>
            <FormField>
              <Label>Class *</Label>
              <Select
                value={formData.class}
                onChange={(e) =>
                  setFormData({ ...formData, class: e.target.value })
                }
                required
              >
                <option value="">Select Class</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Class {i + 1}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField>
              <Label>Board *</Label>
              <Select
                value={formData.board}
                onChange={(e) =>
                  setFormData({ ...formData, board: e.target.value })
                }
                required
              >
                <option value="">Select Board</option>
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="WB">WB</option>
              </Select>
            </FormField>
          </FormSection>

          {/* Add this after the Academic Information Section and before Batch and Centre Section */}
          <FormSection>
            <FormField>
              <Label>Date of Birth *</Label>
              <Input
                type="date"
                value={formData.dob}
                onChange={(e) =>
                  setFormData({ ...formData, dob: e.target.value })
                }
                required
              />
            </FormField>

            <FormField>
              <Label>School Name *</Label>
              <Input
                type="text"
                value={formData.school}
                onChange={(e) =>
                  setFormData({ ...formData, school: e.target.value })
                }
                required
              />
            </FormField>
          </FormSection>

          {/* Batch and Centre Section */}
          <FormSection>
            <FormField>
              <Label>Batch *</Label>
              <Select
                value={formData.batch}
                onChange={(e) =>
                  setFormData({ ...formData, batch: e.target.value })
                }
                required
              >
                <option value="">Select Batch</option>
                {batches.map(
                  (batch) =>
                    !(batch.name === "Chemistry full syllabus (ra)") && (
                      <option key={batch.id} value={batch.name}>
                        {batch.name}
                      </option>
                    ),
                )}
              </Select>
            </FormField>

            <FormField>
              <Label>Centre *</Label>
              <Select
                value={formData.centres[0] || ""}
                onChange={(e) =>
                  setFormData({ ...formData, centres: [e.target.value] })
                }
                required
              >
                <option value="">Select Centre</option>
                {centres.map((centre) => (
                  <option key={centre.id} value={centre.name}>
                    {centre.name}
                  </option>
                ))}
              </Select>
            </FormField>
          </FormSection>

          {/* Password Section */}
          <FormSection>
            <FormField>
              <Label>Password *</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </FormField>

            <FormField>
              <Label>Confirm Password *</Label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
              />
            </FormField>
          </FormSection>

          {/* Add this section after the Password Section and before Submit Button */}
          <ImageSection>
            <Label>Profile Picture *</Label>
            <ImageContainer>
              {formData.imagePreview && (
                <ImagePreview
                  src={formData.imagePreview}
                  alt="Preview"
                />
              )}
              <input
                type="file"
                ref={fileInputRef}
                required
                onChange={handleImageChange}
                accept="image/*"
                style={{ display: "none" }}
              />
                             <ImageButton
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  onMouseEnter={() => setImageButtonHovered(true)}
                  onMouseLeave={() => setImageButtonHovered(false)}
                  hovered={imageButtonHovered}
                >
                  {formData.imagePreview ? "Change Image" : "Choose Image"}
                </ImageButton>
            </ImageContainer>
          </ImageSection>

          {/* Submit Button */}
                     <SubmitButton
              type="submit"
              disabled={loading}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              hovered={isHovered}
              loading={loading}
            >
              {loading ? "Creating Account..." : "Register"}
            </SubmitButton>
        </Form>

        {/* Login Link */}
                  <LoginLink>
            Already have an account?{" "}
            <StyledLink
              to="/login"
            >
              Log In
            </StyledLink>
          </LoginLink>
      </FormContainer>

      {/* Right side image */}
      <RightImageContainer>
        <RightImage
          src="VedMat.png"
          alt="Login"
        />
      </RightImageContainer>
    </SignupContainer>
  );
}

export default SignupPage;
