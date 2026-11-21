# Button hierarchy and destructive actions

Status: Approved

## Purpose

Give secondary actions a clear button treatment and consistent pointer feedback. Make permanent record deletion recognizable at the entry point and unmistakable at confirmation. Reuse the existing 44px target for named icon-only controls in admin navigation.

## Text buttons

| Variant | Treatment | Use |
| --- | --- | --- |
| primary | Café fill and Off-white text on light surfaces | Primary action |
| secondary | Transparent fill, 1px Argila boundary, Café text, and quiet tinted hover | Cancel, back, and other lower-emphasis actions |
| outline | Café outline on light surfaces with a filled hover | Actions that need stronger emphasis than secondary |
| danger | Solid or subdued red treatment | Permanent deletion |

- Text buttons retain the pill, native action or link semantics, and Montserrat label. The secondary label uses 14px at weight 800. Its hover has no underline and uses the same 2px lift as primary and outline. Link destinations, icon slots, loading labels, and existing form submission semantics remain intact.
- The explicit size values are compact (44px), standard (50px), and large (56px). Standard is the shared default. Use compact for dense actions and secondary back navigation, and large for standalone prominent actions. Apply the compact size to admin back and dismiss controls in the affected flows. Preserve route-owned sizing where documented, including the mobile hero. Confirm close/submit rows wrap as needed. Button minimum heights permit wrapped labels to grow.
- Use 150ms transitions for color and pointer feedback. Desktop fine-pointer hover lifts enabled text buttons by 2px. Pointer press scales to 0.98 and takes precedence over hover. Keyboard focus is immediate and visible with a 2px ring offset by 3px. Disabled and busy controls stay still. Reduced motion keeps color changes and the existing opacity-only paw loop. Busy action labels and icons keep their existing behavior.
- On Café, primary and outline keep their existing inverted treatment. The secondary keeps an Off-white label and uses a readable warm boundary and quiet hover; focus uses Off-white. The border of a quiet button supports the visible action label, which carries the meaning.

## Permanent deletion

The red palette is scoped to danger buttons. Alert and Toast retain their feedback tokens.

| Element | Light surface | Café surface |
| --- | --- | --- |
| Solid confirmation fill | #CB241C | #CB241C |
| Solid hover fill | #A91B15 | #A91B15 |
| Solid label | #FFF7F2 | #FFF7F2 |
| Subdued opener fill | #FDE5E3 | #753027 |
| Subdued opener label | #CB241C | #FFDFDC |
| Solid button boundary | #CB241C | #FFB8B2 |
| Subdued opener boundary on hover | #CB241C | #FFB8B2 |
| Offset keyboard focus ring, both emphases | #CB241C | #FFB8B2 |

Only action buttons accept danger. A danger action defaults to solid and can opt into subdued emphasis. The subdued opener carries a decorative trash icon and visible text. The final action uses solid red and explicitly describes what will be deleted. Keep both text contrasts at or above 4.5:1 and check the boundary and offset focus ring against the adjacent surface. The solid fill by itself does not define the control boundary on Café. The subdued opener has a transparent resting border.

Introduce an explicit delete intent in ConfirmDialog. It applies subdued styling to the opener and solid styling to the final submit, sets initial focus on “Cancelar”, and offers a named icon-only “Fechar confirmação” control. Escape, Cancelar, and the close control dismiss without submitting and return focus to the opener. When a typed phrase is configured, keep the existing input and submit gate, and clear the phrase on dismissal so each reopening requires a fresh entry. The delete intent does not infer meaning from interface copy.

Apply the delete intent to the existing role and user deletion actions. Use “Excluir papel definitivamente” and “Excluir usuário definitivamente” at confirmation. Retain the existing consequence descriptions, role restrictions, server actions, and redirect behavior. The separate enable, disable, anonymize, and invitation cancellation pathways keep their existing intent and confirmation requirements.

## Icon-only buttons

Introduce IconButton as an action-only component. Require an explicit accessible label and a decorative icon. Default to a native button with type button. The control measures at least 44×44px, has an 8px radius and a quiet outline, and treats hover and press as local feedback. It has a visible focus ring and adapts its boundary and ink to Café or light surfaces. Actions with consequences or ambiguous icons use visible labels.

Use the component for the admin drawer opener and closer, the desktop sidebar toggle, and the deletion confirmation close. The mobile opener keeps the accessible name “Menu” and changes its 36px circular face to a bordered 44px control with 8px corners. The drawer close becomes icon-only with the accessible name “Fechar menu”; the visible drawer heading stays in place. Keep layout, aria-expanded, and drawer/modal logic with their callers. Collapsed navigation destinations remain links with their existing current-page indication and tooltips. Reuse Base UI trigger composition so each integration renders one interactive element with its original handler, ref, and accessible state. Use Base UI Tooltip for the desktop sidebar toggle. Its text must be hoverable and dismissible with Escape while the button keeps focus and its own accessible name. The mobile drawer and deletion dialog close controls use their named icons without tooltips. Escape on either focused close control dismisses its enclosing layer directly.

## Integration and verification

1. Implement Button, IconButton, and the trash glyph in the shared system and Storybook. Cover sizes, long labels, neutral and danger variants, native navigation, pressed and focused states, busy and disabled states, and both light and dark surfaces. Validate component interaction and axe before integration.
2. Add the deletion intent to ConfirmDialog and wire the existing role and user deletion entry points. Check Cancelar initial focus, Escape and icon close, focus return, correct submit, and a fresh typed phrase on reopening after dismissal. Verify non-delete dialogs retain their existing behavior. Cover relevant paths with unit tests, Storybook and E2E.
3. Migrate the specified admin navigation controls. Preserve the admin header and sidebar composition, drawer focus boundary, expanded state, collapse persistence, and route highlighting. Verify the opener, drawer header and icon close at 390×844. Check the sidebar tooltip and Escape at 834×1194 and 1440×900, with short and narrow checks where wrapping matters.
4. Update DESIGN.md for the new sizes, focus offsets, secondary treatment and deletion-only red exception, and update the admin navigation documentation, then run required repository validations, Storybook and relevant E2E axe checks. Refresh Graphify.
