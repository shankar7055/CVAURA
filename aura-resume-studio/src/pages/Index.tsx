import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import LandingPage from "@/components/LandingPage";
import Workspace from "@/components/Workspace";

const IndexContent = () => {
  const { uploaded } = useApp();

  return (
    <AnimatePresence mode="wait">
      {!uploaded ? (
        <motion.div key="landing" exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
          <LandingPage />
        </motion.div>
      ) : (
        <motion.div
          key="workspace"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="h-screen"
        >
          <Workspace />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Index = () => <IndexContent />;

export default Index;
