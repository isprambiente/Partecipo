import { config, library, dom } from '@fortawesome/fontawesome-svg-core'
import {
  faCalendar,
  faCalendarAlt,
  faCalendarDay,
  faCalendarCheck,
  faChair,
  faChevronLeft,
  faEdit,
  faExclamationTriangle,
  faFileCsv,
  faFilePdf,
  faFolderOpen,
  faGlobe,
  faHeading,
  faHome,
  faImage,
  faLink,
  faList,
  faLock,
  faMapMarker,
  faMaximize,
  faPlay,
  faPlus,
  faRss,
  faSave,
  faSearch,
  faSignature,
  faSignInAlt,
  faSignOutAlt,
  faStop,
  faTicketAlt,
  faTools,
  faTrash,
  faUnlock,
  faUpload,
  faUser,
  faUserClock,
  faUserCog,
  faUsers,
  faUserShield,
} from '@fortawesome/free-solid-svg-icons'


// Change the config to fix the flicker
config.mutateApproach = 'sync'

// We are only using the user-astronaut icon
library.add(
  faCalendar,
  faCalendarAlt,
  faCalendarDay,
  faCalendarCheck,
  faChair,
  faChevronLeft,
  faHeading,
  faEdit,
  faExclamationTriangle,
  faFileCsv,
  faFilePdf,
  faFolderOpen,
  faGlobe,
  faHome,
  faImage,
  faLink,
  faList,
  faLock,
  faMapMarker,
  faMaximize,
  faPlay,
  faPlus,
  faRss,
  faSave,
  faSearch,
  faSignature,
  faSignInAlt,
  faSignOutAlt,
  faStop,
  faTicketAlt,
  faTools,
  faTrash,
  faUnlock,
  faUpload,
  faUser,
  faUserClock,
  faUserCog,
  faUsers,
  faUserShield,
)

// Replace any existing <i> tags with <svg> and set up a MutationObserver to
// continue doing this as the DOM changes.
dom.watch()
