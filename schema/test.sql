USE BrokerTEC;

/* Prueba de funciones */
/* 1. Obtener las recagas hechas hoy por el usuario*/
SELECT FN_GetDailyRechargeUsed(2) AS daily_recharge_used;
/* 2. Obtener el valor total del portafolio de un trader */
SELECT FN_GetPortfolioValue(2) AS portfolio_value;
/* 3. Obtener el maximo tenedor de acciones de una empresa en especifico */
SELECT FN_GetTopHolderAlias(1) AS top_holder;
/* 4. Obtener la cantidad máxima de acciones que un trader puede comprar */
SELECT FN_GetMaxBuyableShares(2, 1) AS max_buyable_shares;
/* 5. Obtener la variación porcentual del precio de una acción en el último día */
SELECT FN_GetPriceVariation(8) AS price_variation;
/* 6. Obtener el porcentaje que tienen los traders en una empresa */
SELECT FN_GetHoldingsDistribution(1) AS traders_pct;





/* prueba formato para fechas 
SELECT r.id_recarga, r.id_wallet, r.monto, DATE_FORMAT(r.fecha, '%Y-%m-%d %H:%i:%s') AS fecha_formateada, w.id_usuario
FROM recarga r
JOIN wallet w ON r.id_wallet = w.id_wallet
WHERE w.id_usuario = 2;
*/