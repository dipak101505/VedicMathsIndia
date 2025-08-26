import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import NotificationBadge from "./NotificationBadge";
import ExamNotificationsDropdown from "./ExamNotificationsDropdown";
import useExamNotifications from "../hooks/useExamNotifications";
import { getStudentByEmail } from '../services/studentService';
import { auth } from '../firebase/config';
import {
  Nav,
  NavContainer,
  BrandLink,
  Logo,
  HamburgerMenu,
  HamburgerLine,
  NavigationMenu,
  MainNavigation,
  NavLink,
  UserMenu,
  CoinsContainer,
  CoinIcon,
  CoinsText,
  PasswordLink,
  LogoutButton,
  LoginLink,
  MOBILE_BREAKPOINT
} from '../styles/components/navbar.styles';

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

  const isMobile = screenWidth <= MOBILE_BREAKPOINT;

  return (
    <Nav>
      <NavContainer>
        {/* Brand Logo */}
        <BrandLink to="/">
          <Logo
            src="https://vedicmathsindia.org/wp-content/uploads/2021/06/vedic-maths-india-logo.webp"
            alt="Zenith Logo"
          />
        </BrandLink>

        {/* Hamburger Menu for Mobile */} 
        {user && isMobile && (
          <HamburgerMenu onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <HamburgerLine />
            <HamburgerLine />
            <HamburgerLine />
          </HamburgerMenu>
        )}

        {/* Navigation Links - Desktop or Mobile Menu Open */} 
        {user && (!isMobile || isMobileMenuOpen) && (
          <NavigationMenu isMobile={isMobile}>
            {/* Main Navigation */}
            <MainNavigation isMobile={isMobile}>
              {!isFranchise && (
                <NavLink
                  to="/meetings"
                  onMouseEnter={() => setIsHovered("meetings")}
                  onMouseLeave={() => setIsHovered("")}
                >
                  Live Class
                </NavLink>
              )}
              {!isFranchise && (
                <NavLink
                  to="/videos"
                  onMouseEnter={() => setIsHovered("videos")}
                  onMouseLeave={() => setIsHovered("")}
                >
                  Videos
                </NavLink>
              )}
              {!isFranchise && (
                <NavLink
                  as="a"
                  href="https://qademotests.collegedoors.com/pages/wl_gateway.php?api_key=PRCDabcdqqxswv81kpw0sco&email=pratham05&nonce=0&target_pg=cdmypage&hash=4719b8d1829954917f0e021a09405d4a56000352"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => setIsHovered("exam")}
                  onMouseLeave={() => setIsHovered("")}
                >
                  Exam
                </NavLink>
              )}
              {isAdmin && (
                <>
                  <NavLink
                    to="/upload"
                    onMouseEnter={() => setIsHovered("upload")}
                    onMouseLeave={() => setIsHovered("")}
                  >
                    Upload
                  </NavLink>
                  <NavLink
                    to="/students"
                    onMouseEnter={() => setIsHovered("students")}
                    onMouseLeave={() => setIsHovered("")}
                  >
                    Management
                  </NavLink>
                  <NavLink
                    to="/exams"
                    onMouseEnter={() => setIsHovered("exams")}
                    onMouseLeave={() => setIsHovered("")}
                  >
                    Exams
                  </NavLink>
                  <NavLink
                    to="/attendance"
                    onMouseEnter={() => setIsHovered("attendance")}
                    onMouseLeave={() => setIsHovered("")}
                  >
                    Attendance
                  </NavLink>
                </>
              )}
              {isFranchise && (
                <>
                  <NavLink
                    to="/students"
                    onMouseEnter={() => setIsHovered("students")}
                    onMouseLeave={() => setIsHovered("")}
                  >
                    Management
                  </NavLink>
                  <NavLink
                    to="/attendance"
                    onMouseEnter={() => setIsHovered("attendance")}
                    onMouseLeave={() => setIsHovered("")}
                  >
                    Attendance
                  </NavLink>
                </>
              )}
            </MainNavigation>

            {/* User Menu */}
            <UserMenu isMobile={isMobile}>
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
                <CoinsContainer>
                  <CoinIcon>💰</CoinIcon>
                  <CoinsText>{coins}</CoinsText>
                </CoinsContainer>
              )}
              
              <PasswordLink
                to="/change-password"
                onMouseEnter={() => setIsHovered("password")}
                onMouseLeave={() => setIsHovered("")}
              >
                Password
              </PasswordLink>
              <LogoutButton
                onClick={handleLogout}
                isHovered={isHovered === "logout"}
                onMouseEnter={() => setIsHovered("logout")}
                onMouseLeave={() => setIsHovered("")}
              >
                <span>Logout</span>
              </LogoutButton>
            </UserMenu>
          </NavigationMenu>
        )}

        {/* Login Link for non-authenticated users */}
        {!user && (
          <LoginLink
            to="/login"
            isHovered={isHovered === "login"}
            onMouseEnter={() => setIsHovered("login")}
            onMouseLeave={() => setIsHovered("")}
          >
            Login
          </LoginLink>
        )}
      </NavContainer>
    </Nav>
  );
}

export default Navbar;
