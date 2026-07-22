# Instalação da Câmera

## Equipamento

- Câmera: Hikvision IDS-2CD7A46G0-IZHS
- Lente: varifocal motorizada 2.8–12 mm
- Alimentação: PoE (IEEE 802.3at, classe 4)
- Resolução: 4 MP
- Slot para microSD

## Local ideal de instalação

A câmera deve ser instalada no corredor de acesso, voltada para dentro da propriedade, de forma a enquadrar a placa frontal dos veículos quando passam.

### Recomendações

- Altura: entre 2,0 m e 2,5 m.
- Distância do ponto de passagem: entre 3 m e 5 m.
- Ângulo: levemente de cima para baixo (cerca de 15° a 25°).
- Posição: centralizada no corredor, para evitar distorção lateral da placa.
- Evite contraluz forte. Se necessário, use WDR e ajuste de exposição.

### Ajuste da lente

Como a lente é varifocal motorizada, o zoom pode ser ajustado remotamente:

- Use 2.8 mm para campo mais aberto se o corredor for curto.
- Use até 6–8 mm para focar melhor na placa se a distância permitir.
- Evite usar 12 mm se o corredor for muito curto — o campo fica muito fechado.

## Configuração da câmera

1. Acesse o IP da câmera pelo navegador.
2. Habilite detecção de veículo (AcuSense).
3. Configure a região de detecção para cobrir o corredor.
4. Ajuste sensibilidade para evitar falsos positivos com pedestres.
5. Habilite snapshot no evento.
6. Configure data/hora por NTP.
7. Anote o IP, usuário e senha para configurar o edge.

## Próximos passos

Após instalar a câmera, teste o acesso RTSP com:

```bash
ffplay rtsp://admin:SENHA@IP_CAMERA:554/Streaming/Channels/101
```

Se o stream abrir, o edge já pode ser configurado.
