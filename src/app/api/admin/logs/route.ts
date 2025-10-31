import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * API Route pour consulter les logs de l'application
 * GET /api/admin/logs?type=pm2&lines=100
 * 
 * Paramètres:
 * - type: pm2 | nginx | system | all (défaut: pm2)
 * - lines: nombre de lignes (défaut: 100)
 * - level: error | warn | info | all (défaut: all)
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const user = await requireAuth();
    
    // Vérifier que l'utilisateur est admin (à adapter selon votre logique)
    // Pour l'instant, on autorise tous les utilisateurs authentifiés
    // TODO: Ajouter une vérification de rôle admin
    
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'pm2';
    const lines = parseInt(searchParams.get('lines') || '100');
    const level = searchParams.get('level') || 'all';

    let logs = '';
    
    try {
      switch (type) {
        case 'pm2':
          // Logs PM2
          const { stdout: pm2Logs } = await execAsync(`pm2 logs sorami-frontend --lines ${lines} --nostream`);
          logs = pm2Logs;
          break;
          
        case 'nginx':
          // Logs Nginx (erreurs)
          try {
            const { stdout: nginxLogs } = await execAsync(`sudo tail -n ${lines} /var/log/nginx/sorami_error.log`);
            logs = nginxLogs;
          } catch {
            logs = 'Impossible de lire les logs Nginx (permissions nécessaires)';
          }
          break;
          
        case 'system':
          // Logs système (syslog)
          try {
            const { stdout: sysLogs } = await execAsync(`sudo journalctl -u sorami-frontend -n ${lines} --no-pager`);
            logs = sysLogs;
          } catch {
            logs = 'Impossible de lire les logs système';
          }
          break;
          
        case 'all':
          // Tous les logs
          const { stdout: allPm2 } = await execAsync(`pm2 logs sorami-frontend --lines ${lines} --nostream`);
          logs = `=== LOGS PM2 ===\n${allPm2}\n\n`;
          
          try {
            const { stdout: allNginx } = await execAsync(`sudo tail -n ${lines} /var/log/nginx/sorami_error.log`);
            logs += `=== LOGS NGINX ===\n${allNginx}`;
          } catch {
            logs += `=== LOGS NGINX ===\nNon disponibles\n`;
          }
          break;
          
        default:
          return NextResponse.json(
            { error: 'Type de log invalide' },
            { status: 400 }
          );
      }
      
      // Filtrer par niveau si demandé
      if (level !== 'all') {
        const logLines = logs.split('\n');
        const filtered = logLines.filter(line => {
          const lowerLine = line.toLowerCase();
          switch (level) {
            case 'error':
              return lowerLine.includes('error') || lowerLine.includes('err');
            case 'warn':
              return lowerLine.includes('warn') || lowerLine.includes('warning');
            case 'info':
              return lowerLine.includes('info');
            default:
              return true;
          }
        });
        logs = filtered.join('\n');
      }
      
      return NextResponse.json({
        success: true,
        type,
        lines: lines,
        level,
        timestamp: new Date().toISOString(),
        logs: logs || 'Aucun log disponible'
      });
      
    } catch (execError: any) {
      console.error('Erreur exécution commande logs:', execError);
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la récupération des logs',
        details: execError.message
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('Erreur API logs:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: error.status || 500 }
    );
  }
}
