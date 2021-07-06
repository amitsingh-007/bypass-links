import ForumIcon from "@ui/icons/forum.svg";
import GraphIcon from "@ui/icons/graph.svg";
import HandshakeIcon from "@ui/icons/handshake.svg";
import MultilingualIcon from "@ui/icons/multilingual.svg";
import PalmIcon from "@ui/icons/palm.svg";
import SecurityIcon from "@ui/icons/security.svg";
import Feature from "@ui/interfaces/feature";

export const firstColumn: Feature[] = [
  {
    icon: HandshakeIcon,
    altIconText: "circle-logo",
    title: "Easy to use",
    content: "Easy to use and straight-forward user interface to operate on",
  },
  {
    icon: PalmIcon,
    altIconText: "palm-logo",
    title: "Automate Browser Actions",
    content:
      "Automate some browser actions like history monitor, turn off autofill, etc",
  },
  {
    icon: ForumIcon,
    altIconText: "forum-logo",
    title: "Forum Surfing Support",
    content: "Surf supported forums and open unvisited links",
  },
];

export const secondColumn: Feature[] = [
  {
    icon: SecurityIcon,
    altIconText: "security-logo",
    title: "Enhanced Privacy",
    content:
      "All data is first encoded at user's device before sending to the server",
  },
  {
    icon: MultilingualIcon,
    altIconText: "multilingual-logo",
    title: "Google Login with TOTP",
    content:
      "Save your tagged bookmarks in your profile with optional TOTP feature",
  },
  {
    icon: GraphIcon,
    altIconText: "graph-logo",
    title: "Continuously Updated",
    content:
      "Continuosusly updated with new features and also fixing vulnerabilities",
  },
];
