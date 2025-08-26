import React, { useState } from "react";
import { doc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/config";
import { getAuth } from "firebase/auth";
import { useAuth } from "../contexts/AuthContext";
import { upsertStudent } from "../services/studentService";
import {
  ModalOverlay,
  ModalContent,
  CloseButton,
  ModalTitle,
  LastUpdatedText,
  FormContainer,
  FormGroup,
  FormLabel,
  FormInput,
  FormSelect,
  FormTextarea,
  HelpText,
  UserTypeContainer,
  UserTypeLabel,
  StatusContainer,
  PaymentTypeContainer,
  PaymentTypeLabel,
  ImagePreviewContainer,
  ImagePreview,
  UploadStatus,
  ButtonContainer,
  SubmitButton,
  StatusMessage,
  MonthlyInstallmentInput,
} from "../styles/components/EditStudentForm.styles";

const EditStudentForm = ({
  student,
  onClose,
  onUpdate,
  batches,
  subjects,
  centres,
}) => {
  const formatBatchValue = (batchValue) => {
    if (!batchValue) return [];
    if (Array.isArray(batchValue)) return batchValue;
    return [batchValue];
  };

  const [formData, setFormData] = useState({
    name: student.name,
    email: student.email,
    batch: formatBatchValue(student.batch),
    centres: student.centres || [],
    subjects: student.subjects || [],
    enrollmentDate: student.enrollmentDate,
    imageUrl: student.imageUrl || "",
    class: student.class || "",
    board: student.board || "",
    mobile: student.mobile || "",
    address: student.address || "",
    status: student.status || "inactive",
    dob: student.dob || "",
    school: student.school || "",
    amountPending: student.amountPending || 0,
    paymentType: student.paymentType || "lumpsum",
    monthlyInstallment: student.monthlyInstallment || 0,
    chatIds: student.chatIds || [],
    userType: student.userType || "student",
  });
  const [status, setStatus] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(student.imageUrl);
  const [isUploading, setIsUploading] = useState(false);
      const { isFranchise } = useAuth();

  const handleUserTypeChange = (e) => {
    const { name, checked } = e.target;
    if (checked) {
      setFormData((prev) => ({ ...prev, userType: name }));
    } else {
      setFormData((prev) => ({ ...prev, userType: "" }));
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") {
      const formattedName =
        value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      setFormData((prev) => ({ ...prev, [name]: formattedName }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubjectsChange = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value,
    );
    setFormData((prev) => ({
      ...prev,
      subjects: selectedOptions,
    }));
  };

  const handleCentresChange = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value,
    );
    setFormData((prev) => ({
      ...prev,
      centres: selectedOptions,
    }));
  };

  const handleBatchesChange = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value,
    );
    setFormData((prev) => ({
      ...prev,
      batch: selectedOptions,
    }));
  };

  const addTextToImage = (imageFile, text) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(imageFile);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Configure text style
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.font = `bold ${img.width * 0.05}px Arial`; // Responsive font size

        // Add text shadow for better visibility
        ctx.shadowColor = "black";
        ctx.shadowBlur = 7;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Add name and batch at bottom
        const name = formData.name || student.name || "Name";
        const batch = formData.batch || student.batch || "Batch";
        const padding = img.width * 0.05;
        const bottomPadding = img.height * 0.05;

        // Draw name
        ctx.fillText(
          name,
          padding,
          img.height - bottomPadding - img.width * 0.05,
        );
        ctx.strokeText(
          name,
          padding,
          img.height - bottomPadding - img.width * 0.05,
        );

        // Draw batch
        const batches = formData.batch.join(", ") || "No Batch";
        ctx.fillText(batches, padding, img.height - bottomPadding);
        ctx.strokeText(batches, padding, img.height - bottomPadding);

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            resolve(
              new File([blob], "student-image.jpg", { type: "image/jpeg" }),
            );
          },
          "image/jpeg",
          0.9,
        );
      };
    });
  };

  const uploadImage = async () => {
    if (!imageFile) return formData.imageUrl;

    setIsUploading(true);
    try {
      const processedImage = await addTextToImage(imageFile);
      const fileName = `student-images/${Date.now()}.jpg`;
      const storageRef = ref(storage, fileName);

      const snapshot = await uploadBytes(storageRef, processedImage);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const processedImage = await addTextToImage(file);
      const previewUrl = URL.createObjectURL(processedImage);
      setImagePreview(previewUrl);
    }
  };

  const validateMobile = (mobile) => {
    return /^[0-9]{10}$/.test(mobile);
  };

  const handleUserStatusToggle = async (uid, enabled) => {
    try {
      const auth = getAuth();
      await auth.updateUser(uid, {
        disabled: !enabled,
      });
      return true;
    } catch (error) {
      console.error("Error updating user status:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateMobile(formData.mobile)) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }

    setStatus("submitting");

    try {
      const imageUrl = imageFile ? await uploadImage() : formData.imageUrl;
      const studentRef = doc(db, "students", student.id);

      await updateDoc(studentRef, {
        ...formData,
        imageUrl: imageUrl || formData.imageUrl,
        updatedAt: new Date(),
      });

      await upsertStudent({
        ...formData,
        imageUrl: imageUrl || formData.imageUrl,
        updatedAt: new Date().toISOString(),
      });

      // Update user authentication status if uid exists
      if (student.uid) {
        const success = await handleUserStatusToggle(
          student.uid,
          formData.status === "active",
        );
        if (!success) {
          alert(
            "Warning: Student data updated but account status change failed",
          );
        }
      }

      onUpdate({
        id: student.id,
        ...formData,
        imageUrl: imageUrl || formData.imageUrl,
      });

      setStatus("success");
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      console.error("Error updating student:", error);
      setStatus("error");
      alert("Error updating student: " + error.message);
    }
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <CloseButton onClick={onClose}>
          ×
        </CloseButton>
        <ModalTitle>Edit Student</ModalTitle>
        <LastUpdatedText>
          Last Updated: {new Date(student.updatedAt?.toDate()).toLocaleString()}
        </LastUpdatedText>
        <FormContainer onSubmit={handleSubmit}>
          <FormGroup>
            <FormLabel>
              Name *
              <FormInput
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </FormLabel>
          </FormGroup>

          <FormGroup>
            <FormLabel>
              Email *
              <FormInput
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </FormLabel>
          </FormGroup>

          <FormGroup>
            <FormLabel>User Type</FormLabel>
            <UserTypeContainer>
              <UserTypeLabel>
                <input
                  type="checkbox"
                  name="parent"
                  checked={formData.userType === "parent"}
                  onChange={handleUserTypeChange}
                />
                Parent
              </UserTypeLabel>
              <UserTypeLabel>
                <input
                  type="checkbox"
                  name="teacher"
                  checked={formData.userType === "teacher"}
                  onChange={handleUserTypeChange}
                />
                Teacher
              </UserTypeLabel>
              <UserTypeLabel>
                <input
                  type="checkbox"
                  name="franchise"
                  checked={formData.userType === "franchise"}
                  onChange={handleUserTypeChange}
                />
                Franchise
              </UserTypeLabel>
              <UserTypeLabel>
                <input
                  type="checkbox"
                  name="student"
                  checked={formData.userType === "student"}
                  onChange={handleUserTypeChange}
                />
                Student
              </UserTypeLabel>
            </UserTypeContainer>
          </FormGroup>

          <FormGroup>
            <FormLabel>
              Class *
              <FormSelect
                name="class"
                value={formData.class}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Class</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Class {i + 1}
                  </option>
                ))}
              </FormSelect>
            </FormLabel>
          </FormGroup>

          <FormGroup>
            <FormLabel>
              Board *
              <FormSelect
                name="board"
                value={formData.board}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Board</option>
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="WB">WB</option>
              </FormSelect>
            </FormLabel>
          </FormGroup>

          <FormGroup>
            <FormLabel>
              Date of Birth *
              <FormInput
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                required
              />
            </FormLabel>
          </FormGroup>

          <FormGroup>
            <FormLabel>
              School Name *
              <FormInput
                type="text"
                name="school"
                value={formData.school}
                onChange={handleInputChange}
                required
              />
            </FormLabel>
          </FormGroup>

          <FormGroup>
            <FormLabel>
              Centres *
              <FormSelect
                multiple
                name="centres"
                value={formData.centres}
                onChange={handleCentresChange}
                required
              >
                {centres.map((centre) => (
                  <option key={centre.id} value={centre.name}>
                    {centre.name}
                  </option>
                ))}
              </FormSelect>
              <HelpText>
                Hold Ctrl (Cmd on Mac) to select multiple centres
              </HelpText>
            </FormLabel>
          </FormGroup>

          <FormGroup>
            <FormLabel>
              Subjects *
              <FormSelect
                multiple
                name="subjects"
                value={formData.subjects}
                onChange={handleSubjectsChange}
              >
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.name}>
                    {subject.name}
                  </option>
                ))}
              </FormSelect>
              <HelpText>
                Hold Ctrl (Cmd on Mac) to select multiple subjects
              </HelpText>
            </FormLabel>
          </FormGroup>

          <FormGroup>
            <FormLabel>
              Batches *
              <FormSelect
                multiple
                name="batches"
                value={formData.batch}
                onChange={handleBatchesChange}
                required
              >
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.name}>
                    {batch.name}
                  </option>
                ))}
              </FormSelect>
              <HelpText>
                Hold Ctrl (Cmd on Mac) to select multiple batches
              </HelpText>
            </FormLabel>
          </FormGroup>

          <FormGroup>
            <FormLabel>
              Enrollment Date *
              <FormInput
                type="date"
                name="enrollmentDate"
                value={formData.enrollmentDate}
                onChange={handleInputChange}
                required
              />
            </FormLabel>
          </FormGroup>

          <FormGroup>
            <FormLabel>
              Mobile Number *
              <FormInput
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                required
                pattern="[0-9]{10}"
              />
              <HelpText>
                Enter 10-digit mobile number
              </HelpText>
            </FormLabel>
          </FormGroup>

          <FormGroup>
            <FormLabel>
              Address *
              <FormTextarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </FormLabel>
          </FormGroup>

          <FormGroup>
            <StatusContainer>
              <input
                type="checkbox"
                checked={formData.status === "active"}
                onChange={(e) => {
                  const newStatus = e.target.checked ? "active" : "inactive";
                  setFormData((prev) => ({
                    ...prev,
                    status: newStatus,
                  }));
                }}
              />
              <span>Active Status ({formData.status})</span>
            </StatusContainer>
            <HelpText>
              Inactive students will not be able to access the platform
            </HelpText>
          </FormGroup>

          <FormGroup>
            <FormLabel>
              Profile Image
              <FormInput
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </FormLabel>
            {imagePreview && (
              <ImagePreviewContainer>
                <ImagePreview
                  src={imagePreview}
                  alt="Student"
                />
              </ImagePreviewContainer>
            )}
            {isUploading && (
              <UploadStatus>
                Uploading image...
              </UploadStatus>
            )}
          </FormGroup>

          <FormGroup>
            <FormLabel>
              Amount Pending
            </FormLabel>
            <FormInput
              type="number"
              name="amountPending"
              value={formData.amountPending}
              onChange={handleInputChange}
              disabled={isFranchise && student.amountPending > 0}
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>
              Payment Type
              <PaymentTypeContainer>
                <PaymentTypeLabel>
                  <input
                    type="radio"
                    name="paymentType"
                    value="lumpsum"
                    checked={formData.paymentType === "lumpsum"}
                    onChange={handleInputChange}
                  />
                  Lump Sum
                </PaymentTypeLabel>
                <PaymentTypeLabel>
                  <input
                    type="radio"
                    name="paymentType"
                    value="recurring"
                    checked={formData.paymentType === "recurring"}
                    onChange={handleInputChange}
                  />
                  Recurring
                </PaymentTypeLabel>
              </PaymentTypeContainer>
            </FormLabel>
          </FormGroup>

          {formData.paymentType === "recurring" && (
            <FormGroup>
              <FormLabel>
                Monthly Installment
                <MonthlyInstallmentInput
                  type="number"
                  name="monthlyInstallment"
                  value={formData.monthlyInstallment}
                  onChange={handleInputChange}
                  min="0"
                />
              </FormLabel>
            </FormGroup>
          )}

          <ButtonContainer>
            <SubmitButton
              type="submit"
              disabled={status === "submitting"}
            >
              {status === "submitting" ? "Updating..." : "Update Student"}
            </SubmitButton>
          </ButtonContainer>

          {status === "success" && (
            <StatusMessage className="success">
              Student updated successfully!
            </StatusMessage>
          )}
          {status === "error" && (
            <StatusMessage className="error">
              Error updating student. Please try again.
            </StatusMessage>
          )}
        </FormContainer>
      </ModalContent>
    </ModalOverlay>
  );
};

export default EditStudentForm;
