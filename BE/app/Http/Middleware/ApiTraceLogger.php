<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiTraceLogger
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Format date exactly like the Go log, set to Asia/Jakarta (WIB)
        $date = now()->setTimezone('Asia/Jakarta')->format('Y/m/d H:i:s');
        
        // Format Headers like map[Key:[value] ...]
        $headers = collect($request->headers->all())->map(function ($value) {
            return '[' . implode(', ', $value) . ']';
        })->toArray();
        $headerStr = 'map[';
        foreach ($headers as $key => $val) {
            // PascalCase headers
            $formattedKey = str_replace(' ', '-', ucwords(str_replace('-', ' ', $key)));
            $headerStr .= $formattedKey . ':' . $val . ' ';
        }
        $headerStr = trim($headerStr) . ']';

        // Get more details
        $method = $request->getMethod();
        $ip = $request->ip();
        $path = $request->getPathInfo();
        $statusCode = $response->getStatusCode();
        $statusEmoji = $statusCode >= 200 && $statusCode < 300 ? '✅' : ($statusCode >= 400 && $statusCode < 500 ? '⚠️' : '❌');

        $body = json_encode($request->all(), JSON_PRETTY_PRINT);
        $responseBody = $response->getContent();
        // Limit response body if it's too huge, but usually fine for APIs.
        if (strlen($responseBody) > 2000) {
            $responseBody = substr($responseBody, 0, 2000) . "... (truncated)";
        }

        $log = "🟢 [$date] [START] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        $log .= "🚀 Request  : $method $path\n";
        $log .= "🌍 Client IP: $ip\n";
        $log .= "📦 Headers  : $headerStr\n";
        $log .= "📩 Body In  : $body\n";
        $log .= "--------------------------------------------------\n";
        $log .= "$statusEmoji Status   : $statusCode\n";
        $log .= "📨 Response : $responseBody\n";
        $log .= "🔴 [$date] [END] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

        // Write directly to file to avoid Laravel's default Monolog prefix
        file_put_contents(storage_path('logs/api_trace.log'), $log, FILE_APPEND);

        return $response;
    }
}
