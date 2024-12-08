require "test_helper"

class CleanJobTest < ActiveJob::TestCase
  test "remove expired expired from happening and ticket" do
    (0..3).each do |h|
      happening = create :happening, start_at: Time.zone.now - h.days
      (0..3).each do |t|
        create :ticket, happening:, by_editor: true
      end
    end
    assert_equal Ticket.count, 16
    perform_enqueued_jobs do
      CleanJob.perform_later(days: 2)
    end
    assert_equal Ticket.count, 12
  end
end
