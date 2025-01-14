if pdf.bounds.height - pdf.cursor < 0
  pdf.start_new_page
end

pdf.text "Biglietto prenotato il #{l ticket.updated_at, format: :detailed} da #{ticket.user.name} #{ticket.user.surname}, email: #{ticket.user.email}", size: 10, color: '000000'
if ticket.answers.present?
  pdf.table ticket.answers.collect{|a| [a.question.title, a.value]}, width: pdf.bounds.width, row_colors: ["FFFFFF","DDDDDD"], cell_style: { size: 10, height: 20}
end
pdf.move_down 15
