import { motion } from 'framer-motion';

export const RoleSelector = ({ selectedRole, onChange }) => {
  const roles = ['User', 'Designer', 'Admin'];

  return (
    <div className="relative flex p-1 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 w-full max-w-sm mx-auto mb-3">
      <div className="absolute inset-y-1 flex w-full pr-2">
        <motion.div
          className="bg-accent rounded-full h-full"
          initial={false}
          animate={{
            x: `${roles.indexOf(selectedRole) * 100}%`,
            width: `${100 / roles.length}%`
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>
      {roles.map((role) => (
        <button
          key={role}
          type="button"
          onClick={() => onChange(role)}
          className={`relative z-10 flex-1 py-1.5 text-sm font-medium transition-colors duration-200 ${
            selectedRole === role ? 'text-gray-900' : 'text-white/60 hover:text-white'
          }`}
        >
          {role}
        </button>
      ))}
    </div>
  );
};
