import React, { useEffect, useMemo, useState } from 'react';
import { Briefcase, Calendar, Home, LogOut, Settings, Shield, X } from 'lucide-react';
import { useInteractiveMenuLayout } from './hooks/useInteractiveMenuLayout';
import { useProfileMenu } from './hooks/useProfileMenu';

export type IconComponentType = React.ElementType<{ className?: string }>;

export interface InteractiveMenuItem {
  label: string;
  icon: IconComponentType;
}

export interface InteractiveMenuProps {
  items?: InteractiveMenuItem[];
  accentColor?: string;
  activeIndex?: number;
  onItemSelect?: (index: number) => void;
  profile?: {
    name: string;
    email: string;
    onLogout: () => void;
    actions?: Array<{
      label: string;
      icon: IconComponentType;
      onClick: () => void;
      tone?: 'default' | 'danger';
    }>;
  };
  className?: string;
  ariaLabel?: string;
}

const defaultItems: InteractiveMenuItem[] = [
  { label: 'home', icon: Home },
  { label: 'strategy', icon: Briefcase },
  { label: 'period', icon: Calendar },
  { label: 'security', icon: Shield },
  { label: 'settings', icon: Settings },
];

const defaultAccentColor = 'var(--component-active-color-default)';

export const InteractiveMenu: React.FC<InteractiveMenuProps> = ({
  items,
  accentColor,
  activeIndex,
  onItemSelect,
  profile,
  className = '',
  ariaLabel = 'Navegación principal',
}) => {
  // refs are provided by hooks (useInteractiveMenuLayout, useProfileMenu)
  const finalItems = useMemo(() => {
    const isValid = items && Array.isArray(items) && items.length >= 2 && items.length <= 5;
    if (!isValid) {
      console.warn("InteractiveMenu: 'items' prop is invalid or missing. Using default items.", items);
      return defaultItems;
    }
    return items;
  }, [items]);

  const [internalActiveIndex, setInternalActiveIndex] = useState(0);
  const isControlled = activeIndex !== undefined;
  const currentActiveIndex = isControlled ? activeIndex : internalActiveIndex;
  const safeActiveIndex = Math.max(0, Math.min(currentActiveIndex, finalItems.length - 1));

  useEffect(() => {
    if (!isControlled && internalActiveIndex >= finalItems.length) {
      setInternalActiveIndex(0);
    }
  }, [finalItems.length, internalActiveIndex, isControlled]);

  // layout & profile hooks (extracted)
  const {
    menuRef,
    tabsRef,
    itemRefs,
    textRefs,
    indicatorStyle,
    menuOffsetStyle,
  } = useInteractiveMenuLayout(finalItems.length, safeActiveIndex);

  const { profileOpen, setProfileOpen, profileMenuRef } = useProfileMenu(false);

  // layout and profile behavior handled by hooks

  const handleItemClick = (index: number) => {
    if (!isControlled) {
      setInternalActiveIndex(index);
    }
    onItemSelect?.(index);
  };

  const navStyle = useMemo(() => {
    const activeColor = accentColor || defaultAccentColor;
    return { '--component-active-color': activeColor } as React.CSSProperties;
  }, [accentColor]);

  return (
    <div ref={profileMenuRef} className={`menuShell ${className}`.trim()}>
      <nav ref={menuRef} className="menu" role="navigation" aria-label={ariaLabel} style={{ ...navStyle, ...menuOffsetStyle }}>
        <span className="menu__indicator" aria-hidden="true" style={indicatorStyle} />
        <div className="menu__tabs" ref={tabsRef}>
          {finalItems.map((item, index) => {
            const isActive = index === safeActiveIndex;
            const IconComponent = item.icon;

            return (
              <button
                key={item.label}
                type="button"
                className={`menu__item ${isActive ? 'active' : ''}`}
                onClick={() => handleItemClick(index)}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                style={{ '--lineWidth': '0px' } as React.CSSProperties}
                data-active={isActive ? 'true' : 'false'}
              >
                <div className="menu__icon">
                  <IconComponent className="icon" />
                </div>
                <span className="menu__textWrap">
                  <strong
                    className={`menu__text ${isActive ? 'active' : ''}`}
                    ref={(el) => {
                      textRefs.current[index] = el;
                    }}
                  >
                    {item.label}
                  </strong>
                </span>
              </button>
            );
          })}
        </div>

        {profile && (
          <button
            type="button"
            className="menu__profileTrigger"
            aria-label={`${profile.name}, abrir perfil`}
            aria-expanded={profileOpen}
            onClick={() => setProfileOpen((next) => !next)}
          >
            <div className="menu__profileAvatar" aria-hidden="true">
              {profile.name?.trim()?.[0]?.toUpperCase() || 'U'}
            </div>
          </button>
        )}
      </nav>

      {profile && profileOpen && (
        <div className="menu__profileSheet" role="menu" aria-label="Perfil de usuario">
          <div className="menu__profileSheetTopRow">
            <button type="button" className="menu__profileClose" aria-label="Cerrar perfil" onClick={() => setProfileOpen(false)}>
              <X size={16} />
            </button>
          </div>
          <div className="menu__profileHeader">
            <div className="menu__profileAvatar menu__profileAvatar--large" aria-hidden="true">
              {profile.name?.trim()?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="menu__profileMeta">
              <p className="menu__profileName">{profile.name}</p>
              <p className="menu__profileEmail">{profile.email}</p>
            </div>
          </div>

          {profile.actions?.length ? (
            <div className="menu__profileActions">
              {profile.actions.map((action) => {
                const ActionIcon = action.icon;
                return (
                  <button
                    key={action.label}
                    type="button"
                    className={`menu__profileAction ${action.tone === 'danger' ? 'menu__profileAction--danger' : ''}`}
                    onClick={() => {
                      setProfileOpen(false);
                      action.onClick();
                    }}
                  >
                    <ActionIcon size={16} />
                    {action.label}
                  </button>
                );
              })}
            </div>
          ) : null}

          <button
            type="button"
            className="menu__profileAction"
            onClick={() => {
              setProfileOpen(false);
              profile.onLogout();
            }}
          >
            <LogOut size={16} />
            Cerrar sesion
          </button>
        </div>
      )}
    </div>
  );
};
