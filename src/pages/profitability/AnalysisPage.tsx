import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Form, Input, Select, Button, Divider, Progress } from 'antd';
import { SimulationOutlined, DollarOutlined } from '@ant-design/icons';
import { mockProfitabilityService } from '../../services/mockProfitabilityService';
import { ProfitabilityData, SimulationScenario } from '../../types/profitability';

const { Option } = Select;

const AnalysisPage: React.FC = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState<ProfitabilityData>({
    exportId: '',
    produto: '',
    quantidade: 0,
    precoVendaUSD: 0,
    precoCompraBRL: 0,
    freteInternacionalUSD: 0,
    freteNacionalBRL: 0,
    taxasPortuarias: 0,
    taxasGovernamentais: 0,
    custoArmazenagem: 0,
    taxaCambioAtual: 5.20,
    taxaCambioPrevista: 5.15
  });
  
  const [calculations, setCalculations] = useState({
    receitaTotalBRL: 0,
    custoTotalBRL: 0,
    lucroBrutoBRL: 0,
    margemLucro: 0,
    scoreRentabilidade: 0,
    scoreRisco: 0,
    lucratividade: 0,
    confiabilidade: 0
  });

  const [analysis, setAnalysis] = useState({
    pontosPositivos: [],
    pontosNegativos: []
  });

  const calculateMetrics = () => {
    const receita = data.precoVendaUSD * data.quantidade * data.taxaCambioAtual;
    const custoTotal = (data.precoCompraBRL * data.quantidade) + 
                      (data.freteInternacionalUSD * data.taxaCambioAtual) + 
                      data.freteNacionalBRL + data.taxasPortuarias + 
                      data.taxasGovernamentais + data.custoArmazenagem;
    
    const lucro = receita - custoTotal;
    const margem = receita > 0 ? (lucro / receita) * 100 : 0;
    
    setCalculations({
      receitaTotalBRL: receita,
      custoTotalBRL: custoTotal,
      lucroBrutoBRL: lucro,
      margemLucro: margem,
      scoreRentabilidade: Math.max(0, Math.min(100, margem * 4 + 60)),
      scoreRisco: Math.random() * 30 + 10,
      lucratividade: margem,
      confiabilidade: 92
    });
  };

  useEffect(() => {
    calculateMetrics();
    setAnalysis(mockProfitabilityService.getAnalysis());
  }, [data]);

  const handleSimulation = (scenario: SimulationScenario) => {
    const result = mockProfitabilityService.simulate(data, scenario);
    console.log('Simulation result:', result);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Análise de Rentabilidade" extra={<DollarOutlined />}>
            <Form
              form={form}
              layout="vertical"
              onValuesChange={(_, values) => setData({ ...data, ...values })}
            >
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="Exportação ID" name="exportId">
                    <Input placeholder="UUID da exportação" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Produto" name="produto">
                    <Select placeholder="Selecione o produto">
                      <Option value="soja">Soja</Option>
                      <Option value="milho">Milho</Option>
                      <Option value="cafe">Café</Option>
                      <Option value="acucar">Açúcar</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Quantidade (ton)" name="quantidade">
                    <Input type="number" step="0.001" onChange={e => setData({...data, quantidade: parseFloat(e.target.value) || 0})} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item label="Preço Venda USD" name="precoVendaUSD">
                    <Input type="number" step="0.01" onChange={e => setData({...data, precoVendaUSD: parseFloat(e.target.value) || 0})} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Preço Compra BRL" name="precoCompraBRL">
                    <Input type="number" step="0.01" onChange={e => setData({...data, precoCompraBRL: parseFloat(e.target.value) || 0})} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Frete Internacional USD" name="freteInternacionalUSD">
                    <Input type="number" step="0.01" onChange={e => setData({...data, freteInternacionalUSD: parseFloat(e.target.value) || 0})} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Frete Nacional BRL" name="freteNacionalBRL">
                    <Input type="number" step="0.01" onChange={e => setData({...data, freteNacionalBRL: parseFloat(e.target.value) || 0})} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item label="Taxas Portuárias" name="taxasPortuarias">
                    <Input type="number" step="0.01" onChange={e => setData({...data, taxasPortuarias: parseFloat(e.target.value) || 0})} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Taxas Governamentais" name="taxasGovernamentais">
                    <Input type="number" step="0.01" onChange={e => setData({...data, taxasGovernamentais: parseFloat(e.target.value) || 0})} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Custo Armazenagem" name="custoArmazenagem">
                    <Input type="number" step="0.01" onChange={e => setData({...data, custoArmazenagem: parseFloat(e.target.value) || 0})} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Taxa Câmbio Atual" name="taxaCambioAtual">
                    <Input type="number" step="0.01" value={data.taxaCambioAtual} onChange={e => setData({...data, taxaCambioAtual: parseFloat(e.target.value) || 0})} />
                  </Form.Item>
                </Col>
              </Row>

              <Row>
                <Col span={6}>
                  <Form.Item label="Taxa Câmbio Prevista" name="taxaCambioPrevista">
                    <Input type="number" step="0.01" value={data.taxaCambioPrevista} onChange={e => setData({...data, taxaCambioPrevista: parseFloat(e.target.value) || 0})} />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Resultado da Análise">
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                Score Rentabilidade: {calculations.scoreRentabilidade.toFixed(0)}%
              </div>
              <div style={{ fontSize: '18px', margin: '8px 0' }}>
                Lucratividade estimada: {calculations.lucratividade.toFixed(1)}%
              </div>
              <div style={{ fontSize: '16px' }}>
                Confiabilidade previsão: {calculations.confiabilidade}%
              </div>
            </div>

            <Progress 
              percent={calculations.scoreRentabilidade} 
              strokeColor="#52c41a"
              format={percent => `${percent?.toFixed(0)}%`}
            />

            <Divider />

            <div>
              <h4 style={{ color: '#52c41a' }}>Pontos Positivos</h4>
              {analysis.pontosPositivos.map((ponto, index) => (
                <div key={index} style={{ color: '#52c41a', marginBottom: '4px' }}>
                  ✓ {ponto}
                </div>
              ))}
            </div>

            <Divider />

            <div>
              <h4 style={{ color: '#ff4d4f' }}>Pontos Negativos</h4>
              {analysis.pontosNegativos.map((ponto, index) => (
                <div key={index} style={{ color: '#ff4d4f', marginBottom: '4px' }}>
                  ⚠ {ponto}
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Simulação de Cenários" extra={<SimulationOutlined />}>
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <Button 
                  block 
                  onClick={() => handleSimulation('dolar_subir')}
                  style={{ marginBottom: '8px' }}
                >
                  Dólar Subir
                </Button>
              </Col>
              <Col span={12}>
                <Button 
                  block 
                  onClick={() => handleSimulation('dolar_cair')}
                  style={{ marginBottom: '8px' }}
                >
                  Dólar Cair
                </Button>
              </Col>
              <Col span={12}>
                <Button 
                  block 
                  onClick={() => handleSimulation('frete_subir')}
                  style={{ marginBottom: '8px' }}
                >
                  Custo Frete Subir
                </Button>
              </Col>
              <Col span={12}>
                <Button 
                  block 
                  onClick={() => handleSimulation('atraso_embarque')}
                  style={{ marginBottom: '8px' }}
                >
                  Atraso Embarque
                </Button>
              </Col>
            </Row>

            <Divider />

            <div>
              <h4>Campos Calculados</h4>
              <p>Receita Total BRL: R$ {calculations.receitaTotalBRL.toFixed(2)}</p>
              <p>Custo Total BRL: R$ {calculations.custoTotalBRL.toFixed(2)}</p>
              <p>Lucro Bruto BRL: R$ {calculations.lucroBrutoBRL.toFixed(2)}</p>
              <p>Margem Lucro: {calculations.margemLucro.toFixed(2)}%</p>
              <p>Score Risco: {calculations.scoreRisco.toFixed(1)}%</p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AnalysisPage;
