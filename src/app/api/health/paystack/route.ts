import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/health/paystack
 * Endpoint de diagnostic de la configuration Paystack (SANS exposer les secrets)
 * Usage: curl https://sorami.app/api/health/paystack
 */
export async function GET(request: NextRequest) {
  try {
    const SECRET = process.env.PAYSTACK_SECRET_KEY || '';
    const PUBLIC = process.env.PAYSTACK_PUBLIC_KEY || '';
    const WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET || '';

    // Informations sur l'environnement (masquées)
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      
      secretKey: {
        configured: !!SECRET && SECRET !== '',
        format: SECRET ? 
          (SECRET.startsWith('sk_test_') ? 'TEST' : 
           SECRET.startsWith('sk_live_') ? 'LIVE' : 
           'INVALID') : 'MISSING',
        prefix: SECRET ? SECRET.substring(0, 10) + '...' : 'N/A',
        length: SECRET ? SECRET.length : 0,
      },
      
      publicKey: {
        configured: !!PUBLIC && PUBLIC !== '',
        format: PUBLIC ? 
          (PUBLIC.startsWith('pk_test_') ? 'TEST' : 
           PUBLIC.startsWith('pk_live_') ? 'LIVE' : 
           'INVALID') : 'MISSING',
        prefix: PUBLIC ? PUBLIC.substring(0, 10) + '...' : 'N/A',
      },
      
      webhookSecret: {
        configured: !!WEBHOOK_SECRET && WEBHOOK_SECRET !== '',
      },

      recommendation: '',
    };

    // Recommandations
    if (!SECRET || SECRET === '') {
      diagnostics.recommendation = 'CRITIQUE: PAYSTACK_SECRET_KEY non configurée. Ajoutez-la dans .env.production';
    } else if (!SECRET.startsWith('sk_test_') && !SECRET.startsWith('sk_live_')) {
      diagnostics.recommendation = 'CRITIQUE: Format de clé invalide. Doit commencer par sk_test_ ou sk_live_';
    } else if (SECRET.startsWith('sk_test_') && process.env.NODE_ENV === 'production') {
      diagnostics.recommendation = 'ATTENTION: Clé TEST détectée en production. Utilisez une clé LIVE (sk_live_)';
    } else {
      diagnostics.recommendation = 'Configuration OK';
    }

    return NextResponse.json(diagnostics);
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Erreur lors du diagnostic',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
