import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { useUpdateObjectViewOptions } from '@/object-record/object-options-dropdown/hooks/useUpdateObjectViewOptions';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TextInput } from '@/ui/input/components/TextInput';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { type View } from '@/views/types/View';
import { useUpdateViewFromCurrentState } from '@/views/view-picker/hooks/useUpdateViewFromCurrentState';
import { viewPickerIsDirtyComponentState } from '@/views/view-picker/states/viewPickerIsDirtyComponentState';
import { viewPickerIsPersistingComponentState } from '@/views/view-picker/states/viewPickerIsPersistingComponentState';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';
import { viewPickerSelectedIconComponentState } from '@/views/view-picker/states/viewPickerSelectedIconComponentState';
import { styled } from '@linaria/react';
import { useEffect, useRef, useState } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { useIcons } from 'twenty-ui/icon';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';
import { useDebouncedCallback } from 'use-debounce';

const StyledDropdownMenuIconAndNameContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  margin-left: 0;
  margin-right: 0;
`;

const StyledMenuTitleContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]};
`;

const StyledMenuIconContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  height: ${themeCssVariables.spacing[6]};
  justify-content: center;
  width: ${themeCssVariables.spacing[6]};
`;

const StyledMainText = styled.div`
  color: ${themeCssVariables.font.color.primary};
  flex-shrink: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type ObjectOptionsDropdownMenuViewNameProps = {
  currentView: View;
};

export const ObjectOptionsDropdownMenuViewName = ({
  currentView,
}: ObjectOptionsDropdownMenuViewNameProps) => {
  const theme = useTheme();
  const [viewPickerSelectedIcon, setViewPickerSelectedIcon] =
    useAtomComponentState(viewPickerSelectedIconComponentState);

  const viewPickerIsPersisting = useAtomComponentStateValue(
    viewPickerIsPersistingComponentState,
  );
  const setViewPickerIsDirty = useSetAtomComponentState(
    viewPickerIsDirtyComponentState,
  );

  const { setAndPersistViewName, setAndPersistViewIcon } =
    useUpdateObjectViewOptions();

  const { updateViewFromCurrentState } = useUpdateViewFromCurrentState();
  const [viewName, setViewName] = useState(currentView?.name);

  const setViewPickerReferenceViewId = useSetAtomComponentState(
    viewPickerReferenceViewIdComponentState,
  );

  // Enter persists through the reference view id, which is only set when the view picker is opened
  // and is lost on reload; point it at the view being renamed so the update targets it.
  useEffect(() => {
    if (isDefined(currentView?.id)) {
      setViewPickerReferenceViewId(currentView.id);
    }
  }, [currentView?.id, setViewPickerReferenceViewId]);

  const inputRef = useRef<HTMLInputElement>(null);
  const { dropdownId } = useObjectOptionsDropdown();

  useHotkeysOnFocusedElement({
    keys: [Key.Enter],
    callback: async () => {
      if (viewPickerIsPersisting) {
        return;
      }

      await updateViewFromCurrentState();
    },
    focusId: dropdownId,
    dependencies: [viewPickerIsPersisting, updateViewFromCurrentState],
  });

  const handleIconChange = ({ iconKey }: { iconKey: string }) => {
    setViewPickerIsDirty(true);
    setViewPickerSelectedIcon(iconKey);
    setAndPersistViewIcon(iconKey, currentView);
  };

  const handleViewNameChange = useDebouncedCallback((value: string) => {
    setAndPersistViewName(value, currentView);
  }, 500);

  useEffect(() => {
    setViewPickerSelectedIcon(currentView.icon);
  }, [currentView.icon, setViewPickerSelectedIcon]);

  useEffect(() => {
    if (currentView?.key !== 'INDEX' && inputRef.current !== null) {
      inputRef.current.focus();
    }
  }, [currentView?.key]);

  const { getIcon } = useIcons();
  const MainIcon = getIcon(currentView?.icon);

  return (
    <>
      {currentView?.key === 'INDEX' ? (
        <StyledMenuTitleContainer>
          <StyledMenuIconContainer>
            <MainIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
          </StyledMenuIconContainer>
          <StyledMainText>
            <OverflowingTextWithTooltip text={currentView.name} />
          </StyledMainText>
        </StyledMenuTitleContainer>
      ) : (
        <DropdownMenuItemsContainer>
          <StyledDropdownMenuIconAndNameContainer>
            <IconPicker
              size="sm"
              onChange={handleIconChange}
              selectedIconKey={viewPickerSelectedIcon}
            />
            <TextInput
              value={viewName}
              onChange={(value) => {
                setViewName(value);
                handleViewNameChange(value);
              }}
              autoGrow={false}
              sizeVariant="sm"
              fullWidth
            />
          </StyledDropdownMenuIconAndNameContainer>
        </DropdownMenuItemsContainer>
      )}
    </>
  );
};
