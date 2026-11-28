    host: process.env.TITAN_SMTP_HOST || 'smtp.titan.email',
    port: Number(process.env.TITAN_SMTP_PORT || 465),
    secure: true,
    auth: { user: process.env.TITAN_SMTP_USER || 'info@connectnetwork.co.za', pass: smtpPassword },
  })
  let provider: { messageId?: string }
  try {
    provider = await transporter.sendMail({
      from, to: rfq.recipient_email,
      subject: `Request for quotation: ${rfq.procurement_reference}`,
      html: `<h1>Request for quotation</h1><p>Reference: <strong>${escapeHtml(rfq.procurement_reference)}</strong></p><p>Connect Network requests your pricing for the following requirement.</p><p><strong>Item/service:</strong> ${escapeHtml(requirement.item)}</p><p><strong>Specifications and quantity:</strong> ${escapeHtml(requirement.specifications_and_quantity)}</p><p><strong>Delivery area:</strong> ${escapeHtml(requirement.delivery_area.municipality)}${escapeHtml(locality)}, ${escapeHtml(requirement.delivery_area.province)}</p>${requiredBy}<p><strong>Customer email for quotations:</strong> <a href="mailto:${escapeHtml(requirement.customer_email)}">${escapeHtml(requirement.customer_email)}</a></p><p>Please reply directly to the customer with your price, availability, delivery terms, VAT treatment and quotation validity.</p><p>Regards,<br/>Connect Network Procurement<br/>info@connectnetwork.co.za</p>`
    })
  } catch (error) {
    const failure = error instanceof Error ? error.message.slice(0, 500) : 'Titan SMTP delivery failed'
    await adminRequest(`procurement_rfq_queue?id=eq.${encodeURIComponent(queueId)}`, {
      method: 'PATCH', body: JSON.stringify({ status: 'failed', failure_reason: failure }),
    })