/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import '@payloadcms/next/css'
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import { connection } from 'next/server'
import React from 'react'

import { importMap } from './admin/importMap.js'
import './custom.scss'

/**
 * Ajout local (le reste du fichier est généré par Payload).
 * L'admin est dynamique par nature (session, préférences) : on l'exempte de la
 * validation « navigation instantanée » (dev uniquement), qui ne s'applique pas
 * à lui. À conserver si Payload régénère ce fichier.
 */
export const instant = false

type Args = {
  children: React.ReactNode
}

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

// Ajout local : rendu à chaque requête, jamais pré-rendu (Payload lit `new Date()`).
const Layout = async ({ children }: Args) => {
  await connection()
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  )
}

export default Layout
