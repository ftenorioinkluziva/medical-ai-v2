'use client'

/**
 * Animated Icon Component
 * Adds smooth animations to Lucide React icons using Framer Motion
 */

import { motion, type Variants } from 'framer-motion'
import { type LucideIcon } from 'lucide-react'
import { type HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import {
  Heart,
  Sparkles,
  Home,
  Target,
  TrendingUp,
  ShoppingCart,
  Clock,
  Send,
  Eye,
  Users,
  FileText,
  FolderOpen,
  Calendar,
  GitCompare,
  Coins,
  ArrowLeftRight,
  User,
  Brain,
  Lightbulb,
  Upload,
  ArrowRight,
} from 'lucide-react'

// Animation variants
const animations = {
  // Hover scale - subtle scale on hover
  'hover-scale': {
    rest: { scale: 1 },
    hover: {
      scale: 1.15,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10
      }
    }
  } as Variants,

  // Pulse - gentle heartbeat effect
  pulse: {
    rest: { scale: 1 },
    hover: {
      scale: [1, 1.15, 1, 1.25, 1],
      transition: {
        duration: 0.6,
        times: [0, 0.2, 0.4, 0.6, 1]
      }
    }
  } as Variants,

  // Glow - sparkle effect with rotation
  glow: {
    rest: { scale: 1, rotate: 0 },
    hover: {
      scale: [1, 1.2, 1],
      rotate: [0, 5, 0],
      transition: {
        duration: 0.5,
        times: [0, 0.5, 1]
      }
    }
  } as Variants,

  // Bounce - playful bounce
  bounce: {
    rest: { y: 0 },
    hover: {
      y: [0, -8, 0],
      transition: {
        duration: 0.4,
        times: [0, 0.5, 1]
      }
    }
  } as Variants,

  // Spin - quick rotation
  spin: {
    rest: { rotate: 0 },
    hover: {
      rotate: 360,
      transition: {
        duration: 0.5,
        ease: 'easeInOut'
      }
    }
  } as Variants,

  // Shake - attention grabber
  shake: {
    rest: { x: 0 },
    hover: {
      x: [-2, 2, -2, 2, 0],
      transition: {
        duration: 0.4
      }
    }
  } as Variants,

  // Float - gentle up and down
  float: {
    rest: { y: 0 },
    animate: {
      y: [-3, 3, -3],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  } as Variants,

  // None - no animation
  none: {
    rest: {},
    hover: {}
  } as Variants
}

export type AnimationType = keyof typeof animations

interface AnimatedIconProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  icon: LucideIcon
  animation?: AnimationType
  size?: number | string
  strokeWidth?: number
  color?: string
  autoAnimate?: boolean // For animations like 'float' that run automatically
}

export const AnimatedIcon = forwardRef<HTMLDivElement, AnimatedIconProps>(
  ({
    icon: Icon,
    animation = 'hover-scale',
    size = 24,
    strokeWidth = 2,
    color,
    autoAnimate = false,
    className,
    ...props
  }, ref) => {
    const variants = animations[animation]
    const shouldAutoAnimate = autoAnimate && animation === 'float'

    return (
      <motion.div
        ref={ref}
        className={cn('inline-flex items-center justify-center', className)}
        initial="rest"
        whileHover="hover"
        animate={shouldAutoAnimate ? 'animate' : 'rest'}
        variants={variants}
        {...props}
      >
        <Icon
          size={size}
          strokeWidth={strokeWidth}
          color={color}
          style={{ display: 'block' }}
        />
      </motion.div>
    )
  }
)

AnimatedIcon.displayName = 'AnimatedIcon'

// Convenience exports for common icon animations
export const HeartIcon = forwardRef<HTMLDivElement, Omit<AnimatedIconProps, 'icon' | 'animation'>>((props, ref) => {
  return <AnimatedIcon ref={ref} icon={Heart} animation="pulse" {...props} />
})
HeartIcon.displayName = 'HeartIcon'

export const SparklesIcon = forwardRef<HTMLDivElement, Omit<AnimatedIconProps, 'icon' | 'animation'>>((props, ref) => {
  return <AnimatedIcon ref={ref} icon={Sparkles} animation="glow" {...props} />
})
SparklesIcon.displayName = 'SparklesIcon'

export const HomeIcon = forwardRef<HTMLDivElement, Omit<AnimatedIconProps, 'icon' | 'animation'>>((props, ref) => {
  return <AnimatedIcon ref={ref} icon={Home} animation="hover-scale" {...props} />
})
HomeIcon.displayName = 'HomeIcon'

export const TargetIcon = forwardRef<HTMLDivElement, Omit<AnimatedIconProps, 'icon' | 'animation'>>((props, ref) => {
  return <AnimatedIcon ref={ref} icon={Target} animation="pulse" {...props} />
})
TargetIcon.displayName = 'TargetIcon'

export const TrendingUpIcon = forwardRef<HTMLDivElement, Omit<AnimatedIconProps, 'icon' | 'animation'>>((props, ref) => {
  return <AnimatedIcon ref={ref} icon={TrendingUp} animation="bounce" {...props} />
})
TrendingUpIcon.displayName = 'TrendingUpIcon'

export const ShoppingCartIcon = forwardRef<HTMLDivElement, Omit<AnimatedIconProps, 'icon' | 'animation'>>((props, ref) => {
  return <AnimatedIcon ref={ref} icon={ShoppingCart} animation="bounce" {...props} />
})
ShoppingCartIcon.displayName = 'ShoppingCartIcon'

export const ClockIcon = forwardRef<HTMLDivElement, Omit<AnimatedIconProps, 'icon' | 'animation'>>((props, ref) => {
  return <AnimatedIcon ref={ref} icon={Clock} animation="spin" {...props} />
})
ClockIcon.displayName = 'ClockIcon'

export const SendIcon = forwardRef<HTMLDivElement, Omit<AnimatedIconProps, 'icon' | 'animation'>>((props, ref) => {
  return <AnimatedIcon ref={ref} icon={Send} animation="hover-scale" {...props} />
})
SendIcon.displayName = 'SendIcon'

export const EyeIcon = forwardRef<HTMLDivElement, Omit<AnimatedIconProps, 'icon' | 'animation'>>((props, ref) => {
  return <AnimatedIcon ref={ref} icon={Eye} animation="hover-scale" {...props} />
})
EyeIcon.displayName = 'EyeIcon'

export const UsersIcon = forwardRef<HTMLDivElement, Omit<AnimatedIconProps, 'icon' | 'animation'>>((props, ref) => {
  return <AnimatedIcon ref={ref} icon={Users} animation="hover-scale" {...props} />
})
UsersIcon.displayName = 'UsersIcon'

export const FileTextIcon = forwardRef<HTMLDivElement, Omit<AnimatedIconProps, 'icon' | 'animation'>>((props, ref) => {
  return <AnimatedIcon ref={ref} icon={FileText} animation="hover-scale" {...props} />
})
FileTextIcon.displayName = 'FileTextIcon'

export const FolderOpenIcon = forwardRef<HTMLDivElement, Omit<AnimatedIconProps, 'icon' | 'animation'>>((props, ref) => {
  return <AnimatedIcon ref={ref} icon={FolderOpen} animation="hover-scale" {...props} />
})
FolderOpenIcon.displayName = 'FolderOpenIcon'

export const CalendarIcon = forwardRef<HTMLDivElement, Omit<AnimatedIconProps, 'icon' | 'animation'>>((props, ref) => {
  return <AnimatedIcon ref={ref} icon={Calendar} animation="hover-scale" {...props} />
})
CalendarIcon.displayName = 'CalendarIcon'

export const GitCompareIcon = forwardRef<HTMLDivElement, Omit<AnimatedIconProps, 'icon' | 'animation'>>((props, ref) => {
  return <AnimatedIcon ref={ref} icon={GitCompare} animation="hover-scale" {...props} />
})
GitCompareIcon.displayName = 'GitCompareIcon'

export const CoinsIcon = forwardRef<HTMLDivElement, Omit<AnimatedIconProps, 'icon' | 'animation'>>((props, ref) => {
  return <AnimatedIcon ref={ref} icon={Coins} animation="glow" {...props} />
})
CoinsIcon.displayName = 'CoinsIcon'

export const ArrowLeftRightIcon = forwardRef<HTMLDivElement, Omit<AnimatedIconProps, 'icon' | 'animation'>>((props, ref) => {
  return <AnimatedIcon ref={ref} icon={ArrowLeftRight} animation="shake" {...props} />
})
ArrowLeftRightIcon.displayName = 'ArrowLeftRightIcon'

export const UserIcon = forwardRef<HTMLDivElement, Omit<AnimatedIconProps, 'icon' | 'animation'>>((props, ref) => {
  return <AnimatedIcon ref={ref} icon={User} animation="hover-scale" {...props} />
})
UserIcon.displayName = 'UserIcon'

export const BrainIcon = forwardRef<HTMLDivElement, Omit<AnimatedIconProps, 'icon' | 'animation'>>((props, ref) => {
  return <AnimatedIcon ref={ref} icon={Brain} animation="glow" {...props} />
})
BrainIcon.displayName = 'BrainIcon'

export const LightbulbIcon = forwardRef<HTMLDivElement, Omit<AnimatedIconProps, 'icon' | 'animation'>>((props, ref) => {
  return <AnimatedIcon ref={ref} icon={Lightbulb} animation="glow" {...props} />
})
LightbulbIcon.displayName = 'LightbulbIcon'

export const UploadIcon = forwardRef<HTMLDivElement, Omit<AnimatedIconProps, 'icon' | 'animation'>>((props, ref) => {
  return <AnimatedIcon ref={ref} icon={Upload} animation="bounce" {...props} />
})
UploadIcon.displayName = 'UploadIcon'

export const ArrowRightIcon = forwardRef<HTMLDivElement, Omit<AnimatedIconProps, 'icon' | 'animation'>>((props, ref) => {
  return <AnimatedIcon ref={ref} icon={ArrowRight} animation="hover-scale" {...props} />
})
ArrowRightIcon.displayName = 'ArrowRightIcon'
