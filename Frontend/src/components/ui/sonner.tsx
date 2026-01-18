import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: 'bg-[#1f2335] text-white border-white/10',
          description: 'text-white/60',
          actionButton: 'bg-white text-black',
          cancelButton: 'bg-white/10 text-white',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
