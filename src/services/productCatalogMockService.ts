import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { 
  Product, 
  ProductFilters, 
  ProductFilterOptions,
  ProductValidationResult,
  AIProductCreationRequest,
  AIProductCreationResponse,
  ProductSmartSearchResult,
  DuplicateDetectionResult,
  CatalogStatistics,
  ProductVersion,
  NCMValidationResult,
  AISuggestions,
  CommodityType,
  Unit,
  Currency,
  PackageType,
  StorageType,
  PriceUnit,
  ProductStatus,
  AIEnrichmentStatus
} from '../types/productCatalog';

@Injectable({
  providedIn: 'root'
})
export class ProductCatalogMockService {
  private products: Product[] = [
    {
      // SOJA PARA EXPORTAÇÃO
      product_id: '1',
      product_code: 'SOJA_EXP_001',
      name: 'Soja em Grão para Exportação',
      short_name: 'Soja Export',
      scientific_name: 'Glycine max',
      description: 'Soja em grão premium para exportação, livre de transgênicos, atendendo padrões internacionais de qualidade e livre de pragas.',
      commodity_type: 'GRAO',
      origin_country: 'Brasil',
      ncm_code: '1201.90.00',
      ncm_description: 'Soja, mesmo triturada, exceto para semeadura',
      hs_code: '1201',
      export_tax: 0.0,
      cfop: '7102',
      cest: undefined,
      requires_export_license: false,
      export_license_type: undefined,
      unit: 'MT',
      net_weight: 1000.0,
      gross_weight: 1020.0,
      volume_m3: 1.3,
      package_type: 'BULK',
      storage_type: 'DRY',
      shelf_life_days: 365,
      standard_price: 450.50,
      currency: 'USD',
      price_unit: 'USD_MT',
      minimum_quantity: 5000.0,
      maximum_quantity: 50000.0,
      futures_exchange: 'CBOT',
      futures_symbol: 'ZS=F',
      quality_specs: {
        moisture_max: 14.0,
        foreign_material_max: 2.0,
        broken_kernels_max: 10.0,
        protein_min: 36.0,
        oil_content_min: 18.0,
        inspection_standard: 'SGS',
        defects_max: 8.0,
        test_weight_min: 54.0,
        certification_organic: false,
        certification_gmo_free: true
      },
      ai_config: {
        ai_generated: true,
        ai_confidence_score: 95.5,
        ai_last_update: new Date('2024-02-25'),
        ai_auto_update_enabled: true,
        ai_enrichment_status: 'COMPLETED',
        ai_confidence_level: 'HIGH',
        ai_auto_classify: true,
        ai_price_prediction: true,
        ai_suggestions: {
          price_prediction: {
            predicted_price: 465.00,
            confidence: 0.87,
            trend: 'UP',
            factors: ['Safra chinesa menor', 'Demand forte Ásia', 'Dólar favorável'],
            updated_at: new Date('2024-02-25'),
            source: 'CBOT'
          }
        }
      },
      status: 'ACTIVE',
      active: true,
      created_at: new Date('2024-01-15'),
      created_by: 'admin',
      updated_at: new Date('2024-02-20'),
      updated_by: 'jsilva',
      version: 2.1
    },
    {
      // MILHO
      product_id: '2',
      product_code: 'MILHO_EXP_001',
      name: 'Milho em Grão Amarelo #2',
      short_name: 'Milho #2',
      scientific_name: 'Zea mays',
      description: 'Milho amarelo grão inteiro, classificação #2, para exportação e ração animal, atendendo especificações internacionais.',
      commodity_type: 'GRAO',
      origin_country: 'Brasil',
      ncm_code: '1005.90.11',
      ncm_description: 'Milho em grão, exceto para semeadura, outros',
      hs_code: '1005',
      export_tax: 0.0,
      requires_export_license: false,
      unit: 'MT',
      net_weight: 1000.0,
      gross_weight: 1015.0,
      volume_m3: 1.28,
      package_type: 'BULK',
      storage_type: 'DRY',
      shelf_life_days: 300,
      standard_price: 180.75,
      currency: 'USD',
      price_unit: 'USD_MT',
      minimum_quantity: 3000.0,
      maximum_quantity: 30000.0,
      futures_exchange: 'CBOT',
      futures_symbol: 'ZC=F',
      quality_specs: {
        moisture_max: 14.0,
        foreign_material_max: 2.0,
        broken_kernels_max: 5.0,
        test_weight_min: 56.0,
        inspection_standard: 'SGS',
        defects_max: 5.0,
        certification_gmo_free: false
      },
      ai_config: {
        ai_generated: false,
        ai_confidence_score: 88.2,
        ai_last_update: new Date('2024-02-22'),
        ai_auto_update_enabled: true,
        ai_enrichment_status: 'COMPLETED',
        ai_confidence_level: 'HIGH',
        ai_auto_classify: true,
        ai_price_prediction: true
      },
      status: 'ACTIVE',
      active: true,
      created_at: new Date('2024-01-10'),
      created_by: 'msilva',
      updated_at: new Date('2024-02-22'),
      version: 1.3
    },
    {
      // CAFÉ ARÁBICA
      product_id: '3',
      product_code: 'CAFE_ARB_001',
      name: 'Café Arábica Santos 17/18',
      short_name: 'Café Santos',
      scientific_name: 'Coffea arabica',
      description: 'Café arábica premium, classificação Santos 17/18, para exportação, origem certificada do Sul de Minas.',
      commodity_type: 'GRAO',
      origin_country: 'Brasil',
      ncm_code: '0901.11.00',
      ncm_description: 'Café não torrado, não descafeinado',
      hs_code: '0901',
      export_tax: 0.0,
      requires_export_license: false,
      unit: 'KG',
      net_weight: 60.0,
      gross_weight: 69.0,
      volume_m3: 0.12,
      package_type: 'BAG',
      storage_type: 'DRY',
      shelf_life_days: 730,
      standard_price: 4.85,
      currency: 'USD',
      price_unit: 'USD_MT',
      minimum_quantity: 100.0,
      maximum_quantity: 1000.0,
      futures_exchange: 'ICE',
      futures_symbol: 'KC=F',
      quality_specs: {
        moisture_max: 12.0,
        foreign_material_max: 0.5,
        defects_max: 4.0,
        inspection_standard: 'SGS',
        certification_organic: true,
        additional_specs: {
          screen_size: '17/18',
          origin_region: 'Sul de Minas',
          altitude_min: 800,
          cupping_score: 85
        }
      },
      ai_config: {
        ai_generated: true,
        ai_confidence_score: 92.8,
        ai_last_update: new Date('2024-02-20'),
        ai_auto_update_enabled: true,
        ai_enrichment_status: 'COMPLETED',
        ai_confidence_level: 'HIGH',
        ai_auto_classify: true,
        ai_price_prediction: true
      },
      status: 'ACTIVE',
      active: true,
      created_at: new Date('2024-02-01'),
      created_by: 'acosta',
      updated_at: new Date('2024-02-20'),
      version: 1.0
    },
    {
      // FARELO DE SOJA
      product_id: '4',
      product_code: 'SOJA_FARELO_001',
      name: 'Farelo de Soja 46% Proteína',
      short_name: 'Farelo Soja 46%',
      scientific_name: 'Glycine max meal',
      description: 'Farelo de soja com 46% de proteína bruta, subproduto da extração do óleo, para ração animal e exportação.',
      commodity_type: 'FARELO',
      origin_country: 'Brasil',
      ncm_code: '2304.00.00',
      ncm_description: 'Tortas e outros resíduos sólidos da extração do óleo de soja',
      hs_code: '2304',
      export_tax: 0.0,
      requires_export_license: false,
      unit: 'MT',
      net_weight: 1000.0,
      gross_weight: 1010.0,
      volume_m3: 1.67,
      package_type: 'BULK',
      storage_type: 'DRY',
      shelf_life_days: 180,
      standard_price: 380.25,
      currency: 'USD',
      price_unit: 'USD_MT',
      minimum_quantity: 2000.0,
      maximum_quantity: 25000.0,
      quality_specs: {
        moisture_max: 12.0,
        protein_min: 46.0,
        fiber_content: 7.0,
        ash_content_max: 7.0,
        inspection_standard: 'SGS'
      },
      ai_config: {
        ai_generated: false,
        ai_confidence_score: 89.5,
        ai_last_update: new Date('2024-02-18'),
        ai_auto_update_enabled: true,
        ai_enrichment_status: 'COMPLETED',
        ai_confidence_level: 'HIGH',
        ai_auto_classify: true,
        ai_price_prediction: true
      },
      status: 'ACTIVE',
      active: true,
      created_at: new Date('2024-01-20'),
      created_by: 'rsilva',
      updated_at: new Date('2024-02-18'),
      version: 1.8
    },
    {
      // AÇÚCAR CRISTAL
      product_id: '5',
      product_code: 'ACUCAR_CRIST_001',
      name: 'Açúcar Cristal Especial VHP',
      short_name: 'Açúcar VHP',
      scientific_name: 'Saccharum officinarum',
      description: 'Açúcar cristal bruto especial VHP (Very High Polarization) para exportação e refinamento.',
      commodity_type: 'PROCESSADO',
      origin_country: 'Brasil',
      ncm_code: '1701.14.00',
      ncm_description: 'Açúcar de cana, bruto, em estado sólido, com adição de aromatizante ou corante',
      hs_code: '1701',
      export_tax: 0.0,
      requires_export_license: false,
      unit: 'MT',
      net_weight: 1000.0,
      gross_weight: 1005.0,
      package_type: 'BULK',
      storage_type: 'DRY',
      shelf_life_days: 720,
      standard_price: 420.80,
      currency: 'USD',
      price_unit: 'USD_MT',
      minimum_quantity: 5000.0,
      maximum_quantity: 50000.0,
      futures_exchange: 'ICE',
      futures_symbol: 'SB=F',
      quality_specs: {
        moisture_max: 0.15,
        ash_content_max: 0.15,
        additional_specs: {
          polarization_min: 99.2,
          icumsa: 150,
          granulometry: 'Fine to Medium'
        },
        inspection_standard: 'SGS'
      },
      ai_config: {
        ai_generated: true,
        ai_confidence_score: 94.2,
        ai_auto_update_enabled: true,
        ai_enrichment_status: 'COMPLETED',
        ai_confidence_level: 'HIGH',
        ai_auto_classify: true,
        ai_price_prediction: true
      },
      status: 'ACTIVE',
      active: true,
      created_at: new Date('2024-01-25'),
      created_by: 'admin',
      updated_at: new Date('2024-02-15'),
      version: 1.2
    }
  ];

  private versions: ProductVersion[] = [];

  constructor() {
    console.log('🌾 ProductCatalogMockService inicializado com', this.products.length, 'produtos!');
  }

  // =====================
  // CRUD BÁSICO
  // =====================

  getProducts(filters?: ProductFilters): Observable<Product[]> {
    console.log('📊 Carregando catálogo de produtos com filtros:', filters);
    
    let filtered = [...this.products];
    
    if (filters) {
      filtered = this.applyFilters(filtered, filters);
    }
    
    return of(filtered).pipe(delay(500));
  }

  getProductById(id: string): Observable<Product | null> {
    const product = this.products.find(p => p.product_id === id);
    return of(product || null).pipe(delay(300));
  }

  createProduct(product: Omit<Product, 'product_id' | 'created_at' | 'updated_at' | 'version'>): Observable<Product> {
    console.log('➕ Criando novo produto:', product.name);
    
    const newProduct: Product = {
      ...product,
      product_id: this.generateProductId(),
      created_at: new Date(),
      updated_at: new Date(),
      version: 1.0
    };
    
    this.products.unshift(newProduct);
    console.log('✅ Produto criado com sucesso:', newProduct);
    
    return of(newProduct).pipe(delay(800));
  }

  bulkCreateProducts(products: Omit<Product, 'product_id' | 'created_at' | 'updated_at' | 'version'>[]): Observable<{success: number, failed: number, results: Product[]}> {
    console.log('📦 Criando produtos em lote:', products.length, 'produtos');
    
    const results: Product[] = [];
    let success = 0;
    let failed = 0;
    
    products.forEach((productData) => {
      try {
        // Verificar se já existe produto com o mesmo código
        const existingProduct = this.products.find(p => p.product_code === productData.product_code);
        
        if (existingProduct) {
          console.log('⚠️ Produto já existe com código:', productData.product_code);
          failed++;
          return;
        }
        
        const newProduct: Product = {
          ...productData,
          product_id: this.generateProductId(),
          created_at: new Date(),
          updated_at: new Date(),
          version: 1.0
        };
        
        this.products.unshift(newProduct);
        results.push(newProduct);
        success++;
        
      } catch (error) {
        console.error('❌ Erro ao criar produto:', productData.name, error);
        failed++;
      }
    });
    
    console.log('✅ Importação em lote concluída:', { success, failed });
    
    return of({ success, failed, results }).pipe(delay(1000));
  }

  updateProduct(id: string, updates: Partial<Product>): Observable<Product> {
    console.log('📝 Atualizando produto ID:', id);
    
    const index = this.products.findIndex(p => p.product_id === id);
    
    if (index === -1) {
      return throwError(() => new Error(`Produto com ID ${id} não encontrado`));
    }
    
    const currentProduct = this.products[index];
    
    // Criar versão histórica
    this.createVersion(currentProduct, Object.keys(updates));
    
    // Atualizar produto
    const updatedProduct: Product = {
      ...currentProduct,
      ...updates,
      updated_at: new Date(),
      version: currentProduct.version + 0.1
    };
    
    this.products[index] = updatedProduct;
    console.log('✅ Produto atualizado com sucesso');
    
    return of(updatedProduct).pipe(delay(600));
  }

  deleteProduct(id: string): Observable<void> {
    console.log('🗑️ Excluindo produto ID:', id);
    
    const index = this.products.findIndex(p => p.product_id === id);
    
    if (index === -1) {
      return throwError(() => new Error(`Produto com ID ${id} não encontrado`));
    }
    
    // Soft delete
    this.products[index] = {
      ...this.products[index],
      deleted_at: new Date(),
      active: false,
      status: 'INACTIVE'
    };
    
    console.log('✅ Produto excluído com sucesso');
    return of(undefined).pipe(delay(500));
  }

  // =====================
  // FUNCIONALIDADES DE IA
  // =====================

  createProductWithAI(request: AIProductCreationRequest): Observable<AIProductCreationResponse> {
    console.log('🤖 Criando produto com IA:', request.user_description);
    
    // Simular análise de IA
    const aiAnalysis = this.analyzeUserDescription(request.user_description);
    
    const partialProduct: Partial<Product> = {
      name: aiAnalysis.suggested_name,
      scientific_name: aiAnalysis.suggested_scientific_name,
      commodity_type: aiAnalysis.suggested_commodity_type,
      ncm_code: aiAnalysis.suggested_ncm_code,
      hs_code: aiAnalysis.suggested_hs_code,
      unit: aiAnalysis.suggested_unit,
      currency: 'USD',
      price_unit: 'USD_MT',
      package_type: 'BULK',
      storage_type: 'DRY',
      origin_country: request.origin_country || 'Brasil',
      status: 'ACTIVE',
      active: true,
      ai_config: {
        ai_generated: true,
        ai_confidence_score: aiAnalysis.confidence_score,
        ai_auto_update_enabled: true,
        ai_enrichment_status: 'COMPLETED',
        ai_confidence_level: aiAnalysis.confidence_score > 90 ? 'HIGH' : 'MEDIUM',
        ai_auto_classify: true,
        ai_price_prediction: true,
        ai_suggestions: aiAnalysis.suggestions
      }
    };
    
    const response: AIProductCreationResponse = {
      product: partialProduct,
      confidence_score: aiAnalysis.confidence_score,
      suggestions: aiAnalysis.suggestions,
      validation_result: {
        isValid: true,
        errors: [],
        warnings: []
      },
      auto_filled_fields: ['name', 'scientific_name', 'commodity_type', 'ncm_code', 'hs_code'],
      requires_user_confirmation: ['standard_price', 'minimum_quantity', 'quality_specs']
    };
    
    return of(response).pipe(delay(2000));
  }

  enrichProductWithAI(productId: string): Observable<Product> {
    console.log('🧠 Enriquecendo produto com IA:', productId);
    
    const product = this.products.find(p => p.product_id === productId);
    
    if (!product) {
      return throwError(() => new Error('Produto não encontrado'));
    }
    
    // Simular enriquecimento
    const enrichedProduct: Product = {
      ...product,
      description: product.description || this.generateAIDescription(product),
      quality_specs: product.quality_specs || this.generateQualitySpecs(product.commodity_type),
      ai_config: {
        ...product.ai_config,
        ai_enrichment_status: 'COMPLETED',
        ai_confidence_score: Math.min(product.ai_config.ai_confidence_score + 5, 100),
        ai_last_update: new Date()
      }
    };
    
    // Atualizar no array
    const index = this.products.findIndex(p => p.product_id === productId);
    this.products[index] = enrichedProduct;
    
    return of(enrichedProduct).pipe(delay(1500));
  }

  searchProductsWithAI(query: string): Observable<ProductSmartSearchResult> {
    console.log('🔍 Busca inteligente:', query);
    
    const normalizedQuery = query.toLowerCase().trim();
    let results: Product[] = [];
    
    // Busca inteligente com IA
    results = this.products.filter(product => {
      return (
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.scientific_name?.toLowerCase().includes(normalizedQuery) ||
        product.product_code.toLowerCase().includes(normalizedQuery) ||
        product.ncm_code.includes(normalizedQuery) ||
        product.hs_code.includes(normalizedQuery) ||
        this.fuzzyMatch(product.name.toLowerCase(), normalizedQuery)
      );
    });
    
    // Simular sugestões de IA
    const aiSuggestions = this.generateSearchSuggestions(query);
    const similarTerms = this.generateSimilarTerms(query);
    
    const searchResult: ProductSmartSearchResult = {
      products: results,
      ai_suggestions: aiSuggestions,
      similar_terms: similarTerms,
      auto_corrections: this.generateAutoCorrections(query),
      search_analytics: {
        query: query,
        results_count: results.length,
        search_time_ms: Math.random() * 100 + 50,
        ai_enhanced: true,
        language_detected: this.detectLanguage(query),
        intent_classification: this.classifySearchIntent(query)
      }
    };
    
    return of(searchResult).pipe(delay(800));
  }

  detectDuplicates(product: Partial<Product>): Observable<DuplicateDetectionResult> {
    console.log('🔍 Detectando duplicatas para:', product.name);
    
    const potentialDuplicates = this.products
      .filter(p => p.commodity_type === product.commodity_type)
      .map(p => {
        const similarity = this.calculateSimilarity(product, p);
        return {
          product: p,
          similarity_score: similarity,
          matching_fields: this.getMatchingFields(product, p),
          differences: this.getDifferences(product, p)
        };
      })
      .filter(d => d.similarity_score > 0.7)
      .sort((a, b) => b.similarity_score - a.similarity_score);
    
    const result: DuplicateDetectionResult = {
      has_duplicates: potentialDuplicates.length > 0,
      potential_duplicates: potentialDuplicates,
      similarity_threshold: 0.7,
      ai_analysis: potentialDuplicates.length > 0 
        ? `Encontrados ${potentialDuplicates.length} produtos similares. Verifique se não são duplicatas.`
        : 'Nenhuma duplicata detectada.'
    };
    
    return of(result).pipe(delay(1000));
  }

  // =====================
  // VALIDAÇÕES E COMPLIANCE
  // =====================

  validateProduct(product: Product): Observable<ProductValidationResult> {
    console.log('✅ Validando produto:', product.name);
    
    const errors: any[] = [];
    const warnings: any[] = [];
    
    // Validações básicas
    if (!product.name || product.name.length < 3) {
      errors.push({
        field: 'name',
        message: 'Nome deve ter pelo menos 3 caracteres',
        code: 'NAME_TOO_SHORT',
        severity: 'ERROR'
      });
    }
    
    if (!product.ncm_code || product.ncm_code.length !== 10) {
      errors.push({
        field: 'ncm_code',
        message: 'Código NCM deve ter 10 dígitos',
        code: 'INVALID_NCM',
        severity: 'ERROR'
      });
    }
    
    if (product.standard_price && product.standard_price <= 0) {
      warnings.push({
        field: 'standard_price',
        message: 'Preço deve ser maior que zero',
        suggestion: 'Considere usar preço de mercado atual',
        ai_generated: true
      });
    }
    
    const result: ProductValidationResult = {
      isValid: errors.length === 0,
      errors: errors,
      warnings: warnings,
      ncm_validation: this.validateNCM(product.ncm_code),
      ai_validation: {
        ai_confidence: product.ai_config.ai_confidence_score,
        classification_correct: true,
        suggested_improvements: [],
        data_quality_score: 85.5,
        enrichment_suggestions: ['Adicionar especificações de qualidade', 'Incluir certificações']
      }
    };
    
    return of(result).pipe(delay(1200));
  }

  validateNCM(ncmCode: string): NCMValidationResult {
    // Simular validação com Receita Federal
    const mockNCMData: Record<string, any> = {
      '1201.90.00': {
        description: 'Soja, mesmo triturada, exceto para semeadura',
        exportTax: 0.0,
        requiresLicense: false
      },
      '1005.90.11': {
        description: 'Milho em grão, exceto para semeadura, outros',
        exportTax: 0.0,
        requiresLicense: false
      },
      '0901.11.00': {
        description: 'Café não torrado, não descafeinado',
        exportTax: 0.0,
        requiresLicense: false
      }
    };
    
    const data = mockNCMData[ncmCode] || {
      description: 'NCM não encontrado',
      exportTax: 0.0,
      requiresLicense: false
    };
    
    return {
      ncm_valid: Boolean(mockNCMData[ncmCode]),
      ncm_description: data.description,
      export_tax_rate: data.exportTax,
      requires_license: data.requiresLicense,
      last_validated: new Date(),
      source: 'RECEITA_FEDERAL'
    };
  }

  // =====================
  // ESTATÍSTICAS E FILTROS
  // =====================

  getCatalogStatistics(): Observable<CatalogStatistics> {
    const activeProducts = this.products.filter(p => p.active);
    const aiGeneratedProducts = this.products.filter(p => p.ai_config.ai_generated);
    
    const productsByCommodity: Record<string, number> = {};
    const productsByCountry: Record<string, number> = {};
    
    this.products.forEach(product => {
      productsByCommodity[product.commodity_type] = (productsByCommodity[product.commodity_type] || 0) + 1;
      productsByCountry[product.origin_country] = (productsByCountry[product.origin_country] || 0) + 1;
    });
    
    const avgConfidence = this.products.reduce((sum, p) => sum + p.ai_config.ai_confidence_score, 0) / this.products.length;
    
    const stats: CatalogStatistics = {
      total_products: this.products.length,
      active_products: activeProducts.length,
      ai_generated_products: aiGeneratedProducts.length,
      products_by_commodity: productsByCommodity as any,
      products_by_country: productsByCountry,
      average_confidence_score: avgConfidence,
      pending_validations: this.products.filter(p => p.ai_config.ai_enrichment_status === 'PENDING').length,
      recent_additions: this.products.filter(p => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return p.created_at > weekAgo;
      }).length,
      price_coverage: (this.products.filter(p => p.standard_price).length / this.products.length) * 100
    };
    
    return of(stats).pipe(delay(600));
  }

  getFilterOptions(): Observable<ProductFilterOptions> {
    const options: ProductFilterOptions = {
      commodity_types: ['GRAO', 'FARELO', 'OLEO', 'FIBRA', 'ANIMAL', 'PROCESSADO'],
      currencies: ['USD', 'BRL', 'EUR', 'CNY', 'ARS'],
      status_options: ['ACTIVE', 'INACTIVE', 'PENDING', 'BLOCKED'],
      origin_countries: ['Brasil', 'Argentina', 'Estados Unidos', 'Paraguai', 'Uruguai'],
      futures_exchanges: ['CBOT', 'CME', 'ICE', 'EUREX', 'BM&F'],
      inspection_standards: ['SGS', 'INTERTEK', 'COTECNA', 'BUREAU_VERITAS', 'TUV'],
      package_types: ['BULK', 'BAG', 'CONTAINER', 'GRANEL', 'EMBALAGEM'],
      storage_types: ['DRY', 'REFRIGERATED', 'AMBIENT', 'CONTROLLED'],
      units: ['MT', 'KG', 'TON', 'BUSHEL', 'SACAS', 'LB'],
      price_units: ['USD_MT', 'USD_BUSHEL', 'BRL_MT', 'USD_TON', 'EUR_MT']
    };
    
    return of(options).pipe(delay(300));
  }

  // =====================
  // MÉTODOS AUXILIARES
  // =====================

  private applyFilters(products: Product[], filters: ProductFilters): Product[] {
    let filtered = [...products];
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.scientific_name?.toLowerCase().includes(search) ||
        p.product_code.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search) ||
        p.ncm_code.includes(search)
      );
    }
    
    if (filters.commodity_types?.length) {
      filtered = filtered.filter(p => filters.commodity_types!.includes(p.commodity_type));
    }
    
    if (filters.currencies?.length) {
      filtered = filtered.filter(p => filters.currencies!.includes(p.currency));
    }
    
    if (filters.status?.length) {
      filtered = filtered.filter(p => filters.status!.includes(p.status));
    }
    
    if (filters.active !== undefined) {
      filtered = filtered.filter(p => p.active === filters.active);
    }
    
    if (filters.ai_generated !== undefined) {
      filtered = filtered.filter(p => p.ai_config.ai_generated === filters.ai_generated);
    }
    
    return filtered;
  }

  private analyzeUserDescription(description: string): any {
    const lowercaseDesc = description.toLowerCase();
    
    // IA simples baseada em palavras-chave
    if (lowercaseDesc.includes('soja') || lowercaseDesc.includes('soybean')) {
      return {
        suggested_name: 'Soja em Grão para Exportação',
        suggested_scientific_name: 'Glycine max',
        suggested_commodity_type: 'GRAO' as CommodityType,
        suggested_ncm_code: '1201.90.00',
        suggested_hs_code: '1201',
        suggested_unit: 'MT' as Unit,
        confidence_score: 95.5,
        suggestions: {
          suggested_price: 450.00,
          suggested_description: 'Soja em grão premium para exportação, atendendo padrões internacionais.'
        }
      };
    }
    
    if (lowercaseDesc.includes('milho') || lowercaseDesc.includes('corn')) {
      return {
        suggested_name: 'Milho em Grão Amarelo',
        suggested_scientific_name: 'Zea mays',
        suggested_commodity_type: 'GRAO' as CommodityType,
        suggested_ncm_code: '1005.90.11',
        suggested_hs_code: '1005',
        suggested_unit: 'MT' as Unit,
        confidence_score: 92.3,
        suggestions: {
          suggested_price: 180.00,
          suggested_description: 'Milho amarelo grão inteiro para exportação e ração animal.'
        }
      };
    }
    
    if (lowercaseDesc.includes('café') || lowercaseDesc.includes('coffee')) {
      return {
        suggested_name: 'Café Arábica',
        suggested_scientific_name: 'Coffea arabica',
        suggested_commodity_type: 'GRAO' as CommodityType,
        suggested_ncm_code: '0901.11.00',
        suggested_hs_code: '0901',
        suggested_unit: 'KG' as Unit,
        confidence_score: 89.7,
        suggestions: {
          suggested_price: 4.80,
          suggested_description: 'Café arábica premium para exportação.'
        }
      };
    }
    
    // Caso genérico
    return {
      suggested_name: description,
      suggested_scientific_name: '',
      suggested_commodity_type: 'GRAO' as CommodityType,
      suggested_ncm_code: '',
      suggested_hs_code: '',
      suggested_unit: 'MT' as Unit,
      confidence_score: 60.0,
      suggestions: {
        suggested_description: 'Produto para exportação'
      }
    };
  }

  private generateAIDescription(product: Product): string {
    const commodity = product.commodity_type;
    const name = product.name;
    
    return `${name} para exportação, classificado como ${commodity}, atendendo padrões internacionais de qualidade e compliance. Produto adequado para o mercado global com especificações técnicas rigorosas.`;
  }

  private generateQualitySpecs(commodityType: CommodityType): any {
    const specs: Record<CommodityType, any> = {
      GRAO: {
        moisture_max: 14.0,
        foreign_material_max: 2.0,
        broken_kernels_max: 10.0,
        inspection_standard: 'SGS'
      },
      FARELO: {
        moisture_max: 12.0,
        protein_min: 44.0,
        fiber_content: 7.0,
        inspection_standard: 'SGS'
      },
      OLEO: {
        moisture_max: 0.2,
        inspection_standard: 'INTERTEK'
      },
      PROCESSADO: {
        moisture_max: 1.0,
        inspection_standard: 'SGS'
      },
      FIBRA: {
        moisture_max: 8.0,
        inspection_standard: 'COTECNA'
      },
      ANIMAL: {
        moisture_max: 10.0,
        protein_min: 15.0,
        inspection_standard: 'SGS'
      }
    };
    
    return specs[commodityType] || specs.GRAO;
  }

  private generateProductId(): string {
    return 'PRD_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  private createVersion(product: Product, changedFields: string[]): void {
    const version: ProductVersion = {
      version_id: this.generateProductId(),
      product_id: product.product_id,
      version: product.version,
      changes_summary: `Alteração em: ${changedFields.join(', ')}`,
      changed_fields: changedFields,
      modified_by: 'system',
      modified_at: new Date(),
      product_snapshot: { ...product }
    };
    
    this.versions.push(version);
  }

  private fuzzyMatch(text: string, query: string): boolean {
    const distance = this.levenshteinDistance(text, query);
    return distance <= 2;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private generateSearchSuggestions(query: string): string[] {
    const suggestions = [
      'soja em grão',
      'milho amarelo',
      'café arábica',
      'farelo de soja',
      'açúcar cristal'
    ];
    
    return suggestions.filter(s => 
      !s.toLowerCase().includes(query.toLowerCase()) && 
      query.toLowerCase() !== s.toLowerCase()
    );
  }

  private generateSimilarTerms(query: string): string[] {
    const terms: Record<string, string[]> = {
      'soja': ['soybean', 'glycine max', 'grão de soja'],
      'milho': ['corn', 'zea mays', 'maize'],
      'café': ['coffee', 'coffea arabica', 'bean']
    };
    
    for (const [key, values] of Object.entries(terms)) {
      if (query.toLowerCase().includes(key)) {
        return values;
      }
    }
    
    return [];
  }

  private generateAutoCorrections(query: string): Record<string, string> {
    const corrections: Record<string, string> = {
      'soia': 'soja',
      'mylho': 'milho',
      'coffe': 'café'
    };
    
    return corrections;
  }

  private detectLanguage(query: string): string {
    const portuguesesWords = ['soja', 'milho', 'café', 'açúcar', 'grão'];
    const englishWords = ['soybean', 'corn', 'coffee', 'sugar', 'grain'];
    
    const hasPortuguese = portuguesesWords.some(word => query.toLowerCase().includes(word));
    const hasEnglish = englishWords.some(word => query.toLowerCase().includes(word));
    
    if (hasPortuguese) return 'pt-BR';
    if (hasEnglish) return 'en-US';
    return 'pt-BR';
  }

  private classifySearchIntent(query: string): any {
    if (/^\d{4}\.\d{2}\.\d{2}$/.test(query)) return 'NCM';
    if (/^\d{4}$/.test(query)) return 'HS_CODE';
    if (query.toLowerCase().includes('glycine') || query.toLowerCase().includes('zea mays')) return 'SCIENTIFIC_NAME';
    return 'PRODUCT_NAME';
  }

  private calculateSimilarity(product1: Partial<Product>, product2: Product): number {
    let matches = 0;
    let total = 0;
    
    if (product1.name && product2.name) {
      total++;
      if (product1.name.toLowerCase() === product2.name.toLowerCase()) matches++;
    }
    
    if (product1.commodity_type && product2.commodity_type) {
      total++;
      if (product1.commodity_type === product2.commodity_type) matches++;
    }
    
    if (product1.ncm_code && product2.ncm_code) {
      total++;
      if (product1.ncm_code === product2.ncm_code) matches++;
    }
    
    return total > 0 ? matches / total : 0;
  }

  private getMatchingFields(product1: Partial<Product>, product2: Product): string[] {
    const matching: string[] = [];
    
    if (product1.name === product2.name) matching.push('name');
    if (product1.commodity_type === product2.commodity_type) matching.push('commodity_type');
    if (product1.ncm_code === product2.ncm_code) matching.push('ncm_code');
    
    return matching;
  }

  private getDifferences(product1: Partial<Product>, product2: Product): string[] {
    const differences: string[] = [];
    
    if (product1.name !== product2.name) differences.push('name');
    if (product1.commodity_type !== product2.commodity_type) differences.push('commodity_type');
    if (product1.standard_price !== product2.standard_price) differences.push('price');
    
    return differences;
  }
}