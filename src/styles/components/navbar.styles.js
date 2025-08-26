import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { theme } from '../theme';

// Define a breakpoint for mobile view
export const MOBILE_BREAKPOINT = 768;

// Main Navbar Container
export const Nav = styled.nav`
  background-color: ${theme.colors.primary.main};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  box-shadow: ${theme.shadows.sm};
  position: sticky;
  top: 0;
  z-index: 1000;
`;

export const NavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

// Brand and Logo
export const BrandLink = styled(Link)`
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-left: -10px;
`;

export const Logo = styled.img`
  height: 40px;
  width: auto;
`;

// Mobile Hamburger Menu
export const HamburgerMenu = styled.div`
  cursor: pointer;
  padding: ${theme.spacing.sm};
  
  @media (min-width: ${MOBILE_BREAKPOINT + 1}px) {
    display: none;
  }
`;

export const HamburgerLine = styled.div`
  width: 25px;
  height: 3px;
  background-color: ${theme.colors.primary.contrast};
  margin: 5px 0;
`;

// Navigation Menu
export const NavigationMenu = styled.div`
  display: flex;
  flex-direction: ${props => props.isMobile ? 'column' : 'row'};
  align-items: ${props => props.isMobile ? 'center' : 'initial'};
  gap: ${props => props.isMobile ? theme.spacing.md : theme.spacing.xl};
  position: ${props => props.isMobile ? 'absolute' : 'static'};
  top: ${props => props.isMobile ? '60px' : 'auto'};
  left: ${props => props.isMobile ? 0 : 'auto'};
  width: ${props => props.isMobile ? '100%' : 'auto'};
  background-color: ${props => props.isMobile ? theme.colors.background.primary : 'transparent'};
  padding: ${props => props.isMobile ? theme.spacing.xl : 0};
  box-shadow: ${props => props.isMobile ? theme.shadows.md : 'none'};
  z-index: 999;
`;

export const MainNavigation = styled.div`
  display: flex;
  flex-direction: ${props => props.isMobile ? 'column' : 'row'};
  align-items: ${props => props.isMobile ? 'center' : 'initial'};
  gap: ${props => props.isMobile ? theme.spacing.md : theme.spacing.xl};
`;

// Navigation Links
export const NavLink = styled(Link)`
  color: ${theme.colors.primary.contrast};
  text-decoration: none;
  font-size: ${theme.typography.fontSizes.sm};
  font-weight: ${theme.typography.fontWeights.medium};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  transition: ${theme.transitions.normal};
  
  &:hover {
    background-color: ${theme.colors.primary.light};
  }
`;

// User Menu Section
export const UserMenu = styled.div`
  display: flex;
  flex-direction: ${props => props.isMobile ? 'column' : 'row'};
  align-items: center;
  gap: ${theme.spacing.md};
  border-left: ${props => props.isMobile ? 'none' : `1px solid ${theme.colors.border.light}`};
  padding-left: ${props => props.isMobile ? 0 : theme.spacing.md};
  margin-top: ${props => props.isMobile ? theme.spacing.md : 0};
`;

// Coins Display
export const CoinsContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 5px ${theme.spacing.md};
  border-radius: 20px;
`;

export const CoinIcon = styled.span`
  margin-right: 5px;
  font-size: 1.2rem;
  animation: coinSpin 6s infinite ease-in-out;
  display: inline-block;
  
  &:hover {
    animation: coinSpin 0.5s infinite linear;
  }
  
  @keyframes coinSpin {
    0% { transform: rotateY(0deg); }
    50% { transform: rotateY(180deg); }
    100% { transform: rotateY(360deg); }
  }
`;

export const CoinsText = styled.span`
  font-weight: ${theme.typography.fontWeights.bold};
  color: ${theme.colors.primary.contrast};
`;

// User Action Links
export const PasswordLink = styled(Link)`
  color: ${theme.colors.primary.contrast};
  text-decoration: none;
  font-size: ${theme.typography.fontSizes.sm};
  font-weight: ${theme.typography.fontWeights.medium};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  transition: ${theme.transitions.normal};
  
  &:hover {
    background-color: ${theme.colors.primary.light};
  }
`;

export const LogoutButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background-color: ${props => props.isHovered ? theme.colors.primary.contrast : 'transparent'};
  color: ${props => props.isHovered ? theme.colors.primary.main : theme.colors.primary.contrast};
  border: 2px solid ${theme.colors.primary.contrast};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  font-size: ${theme.typography.fontSizes.sm};
  font-weight: ${theme.typography.fontWeights.medium};
  transition: ${theme.transitions.normal};
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background-color: ${theme.colors.primary.contrast};
    color: ${theme.colors.primary.main};
  }
`;

// Login Link for non-authenticated users
export const LoginLink = styled(Link)`
  color: ${props => props.isHovered ? theme.colors.primary.main : theme.colors.primary.contrast};
  background-color: ${props => props.isHovered ? theme.colors.primary.contrast : 'transparent'};
  text-decoration: none;
  font-size: ${theme.typography.fontSizes.sm};
  font-weight: ${theme.typography.fontWeights.medium};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.lg};
  border: 2px solid ${theme.colors.primary.contrast};
  transition: ${theme.transitions.normal};
  
  &:hover {
    background-color: ${theme.colors.primary.contrast};
    color: ${theme.colors.primary.main};
  }
`;


