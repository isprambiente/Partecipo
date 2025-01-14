primary = "5f1b2f"
dark = '2d323c'
pdf.text happening.event.title, size: 15, color: dark, style: :bold
pdf.text happening.title, color: primary if happening.title?
pdf.text l(happening.start_at, format: :detailed)
pdf.move_down 5

if happening.tickets.present?
  render happening.tickets, pdf: pdf
else
  pdf.text "Nessuna prenotazione registrata", size: 10, color: 'ff0000'
end
pdf.move_down 10
