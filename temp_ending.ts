      export_status: 'Draft',
      completion_percentage: 45
    };
    return this.createExportacao(aiGeneratedExport);
  }

  runAIAnalysis(exportId: string): Observable<any> {
    console.log('Executando análise IA para exportação:', exportId);
    const analysis = {
      risk_score: Math.floor(Math.random() * 30) + 10,
      compliance_score: Math.floor(Math.random() * 20) + 80,
      recommendations: [
        'Considere utilizar o porto de Paranaguá para reduzir custos',
        'Documentos fitossanitários podem ser processados mais rapidamente'
      ]
    };
    return of(analysis).pipe(delay(2000));
  }
}