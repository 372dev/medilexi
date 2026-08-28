import { redirect } from 'next/navigation'

/* The community workspace will eventually live at the root, but until it exists
   there is nothing to offer here, so send visitors straight to the live product,
   Medi Lexi. Temporary (307): '/' is reclaimed when the workspace ships. The
   Inter Lexi landing stays reachable at /welcome via the header's home icon. */
export default function RootIndex() {
  redirect('/medical')
}
