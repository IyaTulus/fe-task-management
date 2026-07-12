
import { ClipboardTask24Regular, Settings24Regular, ChevronDown16Regular } from "@fluentui/react-icons";
import {
    Avatar,
    Button,
    makeStyles,
    Text,
    tokens,
} from "@fluentui/react-components";

interface MenuItem {
    title: string;
    icon: React.ReactNode;
    active?: boolean;
}


const menus: MenuItem[] = [
    {
        title: "Task List",
        icon: <ClipboardTask24Regular />,
    },
    {
        title: "Settings",
        icon: <Settings24Regular />,
    }
]

const useStyles = makeStyles({
    sidebar: {
        backgroundColor: tokens.colorNeutralBackground1,
        borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
    },

    header: {
        borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    },

    title: {
        fontSize: tokens.fontSizeBase600,
        fontWeight: tokens.fontWeightSemibold,
        color: tokens.colorNeutralForeground1
    },

    activeMenu: {
        backgroundColor: tokens.colorBrandBackground2,
        color: tokens.colorBrandForeground1,
    },

})

export function Sidebar() {
    const style = useStyles();

    return (
        <aside className={`flex flex-col h-screen ${style.sidebar}`}>
            <header className={`p-5 ${style.header}`}>
                <Text className={`${style.title} `}>Task Management</Text>
            </header>

            <nav className={`flex flex-col px-2 py-3 gap-2`}>
                {menus.map((menu, index) => (
                    <Button
                        key={index}
                        className={`flex! justify-start! w-full! ${menu.active && style.activeMenu}`}
                        icon={menu.icon}
                        appearance="subtle"
                        color="transparent"
                    >
                        {menu.title}
                    </Button>
                ))}
            </nav>
            <footer className={`mt-auto px-2 py-3`}>
                <Button
                    appearance="subtle"
                    iconPosition="after"
                    icon={<ChevronDown16Regular />}
                    className={`w-full justify-between items-center`}
                >
                    <div className={`flex items-center gap-3`}>
                        <Avatar
                            name="John Doe"
                            initials="JD"
                            color="brand"
                        />

                        <div className={`flex flex-col items-start`}>
                            <Text weight="semibold">John Doe</Text>
                            <Text size={200}>Admin</Text>
                        </div>
                    </div>

                </Button>
            </footer>
        </aside>
    );
}