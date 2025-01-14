primary = "5f1b2f"
dark = '2d323c'

pdf.bounding_box([0, pdf.bounds.height], width: pdf.bounds.width, height: 80) do
  pdf.image Rails.root.join('app','assets','images','logo.png'), height: 40
end
pdf.bounding_box([60, pdf.bounds.height - 10], width: pdf.bounds.width, height: 80) do
  pdf.text ENV.fetch('RAILS_TITLE', 'Partecipo'), size: 30, color: primary, style: :bold
end

string = "#{ENV.fetch('RAILS_TITLE', 'Partecipo')} | page <page> of <total>"
options = { :at => [0, 0],
 :width => pdf.bounds.width,
 :align => :center,
 :start_count_at => 1,
 :color => "5f1b2f" }
pdf.number_pages string, options

pdf.move_down 60
