import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import NotificationBadge from "./NotificationBadge";
import ExamNotificationsDropdown from "./ExamNotificationsDropdown";
import useExamNotifications from "../hooks/useExamNotifications";
import { getStudentByEmail } from '../services/studentService';
import { auth } from '../firebase/config';

// Define a breakpoint for mobile view
const MOBILE_BREAKPOINT = 768; // You can adjust this value

function Navbar() {
  const { user, isAdmin, logout, isFranchise } = useAuth();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState("");
  const [studentData, setStudentData] = useState(null);
  const [coins, setCoins] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  
  // Effect to update screenWidth on resize
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      if (window.innerWidth > MOBILE_BREAKPOINT) {
        setIsMobileMenuOpen(false); // Close mobile menu on resize to desktop
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Fetch student data when component mounts
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user || isAdmin || isFranchise) return;
      
      try {
        const student = await getStudentByEmail(user.email);
        
        if (student) {
          setStudentData({
            id: student?.SK || 1,
            ...student,
          });
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };
    
    fetchStudentData();
  }, [user, isAdmin, isFranchise]);
  
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const userEmail = auth.currentUser?.email;
        if (userEmail) {
          const studentData = await getStudentByEmail(userEmail);
          setCoins(studentData?.coins || 0);
        }
      } catch (error) {
        console.error('Error fetching coins:', error);
      }
    };
    
    fetchCoins();
    
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchCoins();
      else setCoins(0);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Initialize notifications hook
  const {
    upcomingExams,
    pastWeekExams,
    examCount,
    isDropdownOpen,
    toggleDropdown,
    closeDropdown
  } = useExamNotifications(studentData);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <nav
      style={{
        backgroundColor: "#0a6ba0",
        padding: "12px 24px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.04)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginLeft: "-10px",
          }}
        >
          <img
            src="https://vedicmathsindia.org/wp-content/uploads/2021/06/vedic-maths-india-logo.webp"
            alt="Zenith Logo"
            style={{
              height: "40px",
              width: "auto",
            }}
          />
        </Link>

        {/* Hamburger Menu for Mobile */} 
        {user && screenWidth <= MOBILE_BREAKPOINT && (
          <div 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              cursor: "pointer",
              padding: "8px",
              // Basic hamburger icon styles
            }}
          >
            <div style={{ width: "25px", height: "3px", backgroundColor: "white", margin: "5px 0" }}></div>
            <div style={{ width: "25px", height: "3px", backgroundColor: "white", margin: "5px 0" }}></div>
            <div style={{ width: "25px", height: "3px", backgroundColor: "white", margin: "5px 0" }}></div>
          </div>
        )}

        {/* Navigation Links - Desktop or Mobile Menu Open */} 
        {user && (screenWidth > MOBILE_BREAKPOINT || isMobileMenuOpen) && (
          <div
            style={{
              display: "flex",
              flexDirection: screenWidth <= MOBILE_BREAKPOINT ? "column" : "row",
              alignItems: screenWidth <= MOBILE_BREAKPOINT ? "center" : "initial", // Center items in mobile
              gap: screenWidth <= MOBILE_BREAKPOINT ? "16px" : "32px", // Adjust gap for mobile
              position: screenWidth <= MOBILE_BREAKPOINT ? "absolute" : "static", // Position for mobile overlay
              top: screenWidth <= MOBILE_BREAKPOINT ? "60px" : "auto", // Position below navbar
              left: screenWidth <= MOBILE_BREAKPOINT ? 0 : "auto",
              width: screenWidth <= MOBILE_BREAKPOINT ? "100%" : "auto",
              backgroundColor: screenWidth <= MOBILE_BREAKPOINT ? "white" : "transparent", // Background for mobile overlay
              padding: screenWidth <= MOBILE_BREAKPOINT ? "24px" : "0", // Padding for mobile
              boxShadow: screenWidth <= MOBILE_BREAKPOINT ? "0 4px 6px rgba(0,0,0,0.1)" : "none", // Shadow for mobile
              zIndex: 999, // Ensure mobile menu is on top
            }}
          >
            {/* Main Navigation */}
            <div
              style={{
                display: "flex",
                flexDirection: screenWidth <= MOBILE_BREAKPOINT ? "column" : "row", // Stack vertically in mobile
                alignItems: screenWidth <= MOBILE_BREAKPOINT ? "center" : "initial", // Center items in mobile
                gap: screenWidth <= MOBILE_BREAKPOINT ? "16px" : "24px", // Adjusted gap for mobile vs desktop
              }}
            >
              {!isFranchise && (
                <Link
                  to="/meetings"
                  style={{
                    color:
                      isHovered === "meetings" ||
                      window.location.pathname.includes("meetings")
                        ? "white"
                        : "white",
                    textDecoration: "none",
                    fontSize: "15px",
                    fontWeight: "500",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={() => setIsHovered("meetings")}
                  onMouseLeave={() => setIsHovered("")}
                >
                  Live Class
                </Link>
              )}
              {!isFranchise && (
                <Link
                  to="/videos"
                  style={{
                    color:
                      isHovered === "videos" ||
                      window.location.pathname.includes("videos")
                        ? "white"
                        : "white",
                    textDecoration: "none",
                    fontSize: "15px",
                    fontWeight: "500",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={() => setIsHovered("videos")}
                  onMouseLeave={() => setIsHovered("")}
                >
                  Videos
                </Link>
              )}
              {isAdmin && (
                <>
                  <Link
                    to="/upload"
                    style={{
                      color:
                        isHovered === "upload" ||
                        window.location.pathname.includes("upload")
                          ? "white"
                          : "white",
                      textDecoration: "none",
                      fontSize: "15px",
                      fontWeight: "500",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={() => setIsHovered("upload")}
                    onMouseLeave={() => setIsHovered("")}
                  >
                    Upload
                  </Link>
                  <Link
                    to="/students"
                    style={{
                      color:
                        isHovered === "students" ||
                        window.location.pathname.includes("students")
                          ? "white"
                          : "white",
                      textDecoration: "none",
                      fontSize: "15px",
                      fontWeight: "500",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={() => setIsHovered("students")}
                    onMouseLeave={() => setIsHovered("")}
                  >
                    Management
                  </Link>
                  <Link
                  to="/exams"
                  style={{
                    color:
                      isHovered === "exams" ||
                      window.location.pathname.includes("exams")
                        ? "white"
                        : "white",
                    textDecoration: "none",
                    fontSize: "15px",
                    fontWeight: "500",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={() => setIsHovered("exams")}
                  onMouseLeave={() => setIsHovered("")}
                >
                  Exams
                </Link>
                  <Link
                    to="/attendance"
                    style={{
                      color:
                        isHovered === "attendance" ||
                        window.location.pathname.includes("attendance")
                          ? "white"
                          : "white",
                      textDecoration: "none",
                      fontSize: "15px",
                      fontWeight: "500",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={() => setIsHovered("attendance")}
                    onMouseLeave={() => setIsHovered("")}
                  >
                    Attendance
                  </Link>
                </>
              )}
              {isFranchise && (
                <>
                  <Link
                    to="/students"
                    style={{
                      color:
                        isHovered === "students" ||
                        window.location.pathname.includes("students")
                          ? "white"
                          : "white",
                      textDecoration: "none",
                      fontSize: "15px",
                      fontWeight: "500",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={() => setIsHovered("students")}
                    onMouseLeave={() => setIsHovered("")}
                  >
                    Management
                  </Link>
                  <Link
                    to="/attendance"
                    style={{
                      color:
                        isHovered === "attendance" ||
                        window.location.pathname.includes("attendance")
                          ? "white"
                          : "white",
                      textDecoration: "none",
                      fontSize: "15px",
                      fontWeight: "500",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={() => setIsHovered("attendance")}
                    onMouseLeave={() => setIsHovered("")}
                  >
                    Attendance
                  </Link>
                </>
              )}
            </div>

            {/* User Menu */}
            <div
              style={{
                display: "flex",
                flexDirection: screenWidth <= MOBILE_BREAKPOINT ? "column" : "row", // Apply column layout for mobile
                alignItems: screenWidth <= MOBILE_BREAKPOINT ? "center" : "center", // Align to center for mobile
                gap: "16px",
                borderLeft: screenWidth <= MOBILE_BREAKPOINT ? "none" : "1px solid #e2e8f0", // Remove border for mobile
                paddingLeft: screenWidth <= MOBILE_BREAKPOINT ? "0" : "16px", // Remove padding for mobile
                marginTop: screenWidth <= MOBILE_BREAKPOINT ? "16px" : "0", // Add margin top for mobile
              }}
            >
              {/* Exam Notifications - Only show for students */}
              {user && !isAdmin && !isFranchise && (
                <div style={{ position: "relative" }}>
                  <NotificationBadge 
                    count={examCount} 
                    onClick={toggleDropdown} 
                  />
                  <ExamNotificationsDropdown 
                    exams={upcomingExams} 
                    pastWeekExams={pastWeekExams}
                    isOpen={isDropdownOpen} 
                    onClose={closeDropdown} 
                  />
                </div>
              )}
              
              {/* Coins display */}
              {user && !isAdmin && !isFranchise && (
                <>
                  <style>
                    {`
                      @keyframes coinSpin {
                        0% { transform: rotateY(0deg); }
                        50% { transform: rotateY(180deg); }
                        100% { transform: rotateY(360deg); }
                      }
                      
                      .coin-icon {
                        animation: coinSpin 6s infinite ease-in-out;
                        display: inline-block;
                      }
                      
                      .coin-icon:hover {
                        animation: coinSpin 0.5s infinite linear;
                      }
                    `}
                  </style>
                  
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "5px 12px",
                    borderRadius: "20px",
                  }}>
                    <span 
                      className="coin-icon"
                      style={{
                        marginRight: "5px",
                        fontSize: "1.2rem",
                      }}
                    >
                     💰
                    </span>
                    <span style={{
                      fontWeight: "bold",
                      color: "white",
                    }}>{coins}</span>
                  </div>
                </>
              )}
              
              <Link
                to="/change-password"
                style={{
                  color: isHovered === "password" ? "white" : "white",
                  textDecoration: "none",
                  fontSize: "15px",
                  fontWeight: "500",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={() => setIsHovered("password")}
                onMouseLeave={() => setIsHovered("")}
              >
                Password
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  padding: "8px 16px",
                  backgroundColor: isHovered === "logout" ? "white" : "transparent",
                  color: isHovered === "logout" ? "#0a6ba0" : "white",
                  border: "2px solid white",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "15px",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
                onMouseEnter={() => setIsHovered("logout")}
                onMouseLeave={() => setIsHovered("")}
              >
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}

        {/* Login Link for non-authenticated users */}
        {!user && (
          <Link
            to="/login"
            style={{
              color: isHovered === "login" ? "#0a6ba0" : "white",
              backgroundColor: isHovered === "login" ? "white" : "transparent",
              textDecoration: "none",
              fontSize: "15px",
              fontWeight: "500",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "2px solid white",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={() => setIsHovered("login")}
            onMouseLeave={() => setIsHovered("")}
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
