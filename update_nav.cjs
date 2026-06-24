const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');
const lines = content.split('\n');

// Update Mobile Nav
const mobileNavStart = lines.findIndex(l => l.includes('const mobileNavItems = ['));
if (mobileNavStart === -1) {
  // If not defined as a const, find the array directly in the JSX
  const mobileNavJSXStart = lines.findIndex(l => l.includes('{['));
  const mobileNavJSXEnd = lines.findIndex(l => l.includes('].map((tab) => ('));
  
  const newMobileNav = `                {[
                  { id: 'home', icon: Home, label: 'Home' },
                  { id: 'explore', icon: Compass, label: 'Explore' },
                  { id: 'journeys', icon: Navigation, label: 'Journeys' },
                  { id: 'consult', icon: MessageSquare, label: 'Consult' },
                  { id: 'notice-board', icon: MapPin, label: 'Board' },
                  { id: 'profile', icon: User, label: 'Profile' }
                ].map((tab) => (`;
  lines.splice(mobileNavJSXStart, mobileNavJSXEnd - mobileNavJSXStart + 1, newMobileNav);
}

// Update Desktop Nav
const desktopNavStart = lines.findIndex(l => l.includes('{[') && lines[l-1] && lines[l-1].includes('nav'));
const desktopNavEnd = lines.findIndex((l, i) => i > desktopNavStart && l.includes('].map((tab) => ('));

const newDesktopNav = `                  {[
                    { id: 'home', icon: Home, label: 'Home' },
                    { id: 'explore', icon: Compass, label: 'Explore' },
                    { id: 'journeys', icon: Navigation, label: 'Journeys' },
                    { id: 'consult', icon: MessageSquare, label: 'Consult' },
                    { id: 'notice-board', icon: MapPin, label: 'Board' },
                    { id: 'profile', icon: User, label: 'Profile' }
                  ].map((tab) => (`;
lines.splice(desktopNavStart, desktopNavEnd - desktopNavStart + 1, newDesktopNav);

fs.writeFileSync('src/App.tsx', lines.join('\n'));
console.log('Navigation updated successfully');
