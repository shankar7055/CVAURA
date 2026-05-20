import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './GooeyNav.css';

interface GooeyNavItem {
  label: string;
  href: string;
}

interface GooeyNavProps {
  items: GooeyNavItem[];
  initialActiveIndex?: number;
}

const GooeyNav = ({ items, initialActiveIndex = 0 }: GooeyNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveIndex = () => {
    const idx = items.findIndex(item => {
      if (item.href === '/') return location.pathname === '/';
      return location.pathname.startsWith(item.href);
    });
    return idx >= 0 ? idx : initialActiveIndex;
  };

  const [activeIndex, setActiveIndex] = useState(getActiveIndex);

  useEffect(() => {
    setActiveIndex(getActiveIndex());
  }, [location.pathname]);

  const handleClick = (e: React.MouseEvent, index: number, href: string) => {
    e.preventDefault();
    if (activeIndex === index) return;
    setActiveIndex(index);

    if (href.startsWith('http')) {
      window.open(href, '_blank');
    } else {
      navigate(href);
    }
  };

  return (
    <div className="gooey-nav-container">
      <nav>
        <ul>
          {items.map((item, index) => (
            <li
              key={index}
              className={activeIndex === index ? 'active' : ''}
              onClick={e => handleClick(e, index, item.href)}
            >
              <a href={item.href} onClick={e => e.preventDefault()}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default GooeyNav;
