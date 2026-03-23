import { Hero } from '@/components/hero'
import { Features } from '@/components/features'
import { Pricing } from '@/components/pricing'

/**
 * @description Renders the public landing page sections for marketing content.
 * @param None
 * @returns Landing page UI including hero, features, and pricing sections.
 * @throws Never throws.
 */
export default function Home(): JSX.Element {
  return (
    <div>
      <Hero />
      <Features />
      <Pricing />
    </div>
  )
}