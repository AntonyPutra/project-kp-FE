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

        $body = json_encode($request->all(), JSON_PRETTY_PRINT);
        $responseBody = $response->getContent();

        $log = "$date [Start]\n";
        $log .= "$date EndPoint : " . $request->getPathInfo() . "\n";
        $log .= "$date Header : $headerStr\n";
        $log .= "$date Body : $body\n\n";
        $log .= "$date Response : $responseBody\n\n";
        $log .= "$date [End]\n\n";

        // Write directly to file to avoid Laravel's default Monolog prefix
        file_put_contents(storage_path('logs/api_trace.log'), $log, FILE_APPEND);

        return $response;
    }
}
