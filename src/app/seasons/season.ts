// season.model.ts
export class SeasonModel {
  season_id: number = 0;
  id: number = 0; // Alias for season_id
  organisation: number = 0;
  season: string = '';
  start_date?: string = '';
  end_date?: string = '';
  status: boolean = true;
  deleted: boolean = false;
  date_time_added?: string = '';

  // Additional display fields
  organisation_name?: string = '';

  constructor(data?: Partial<SeasonModel>) {
    if (data) {
      Object.assign(this, data);
      this.id = data.season_id || data.id || 0;
    }
  }

  /**
   * Check if season is currently active (based on dates)
   */
  isCurrentlyActive(): boolean {
    if (!this.start_date || !this.end_date) {
      return false;
    }

    const today = new Date();
    const start = new Date(this.start_date);
    const end = new Date(this.end_date);

    return today >= start && today <= end;
  }

  /**
   * Get season duration in days
   */
  getDurationInDays(): number {
    if (!this.start_date || !this.end_date) {
      return 0;
    }

    const start = new Date(this.start_date);
    const end = new Date(this.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * Check if season has started
   */
  hasStarted(): boolean {
    if (!this.start_date) {
      return false;
    }

    const today = new Date();
    const start = new Date(this.start_date);

    return today >= start;
  }

  /**
   * Check if season has ended
   */
  hasEnded(): boolean {
    if (!this.end_date) {
      return false;
    }

    const today = new Date();
    const end = new Date(this.end_date);

    return today > end;
  }

  /**
   * Get season status text
   */
  getStatusText(): string {
    if (!this.status) {
      return 'Inactive';
    }

    if (this.deleted) {
      return 'Deleted';
    }

    if (!this.start_date || !this.end_date) {
      return 'Active';
    }

    if (!this.hasStarted()) {
      return 'Upcoming';
    }

    if (this.isCurrentlyActive()) {
      return 'Current';
    }

    if (this.hasEnded()) {
      return 'Ended';
    }

    return 'Active';
  }

  /**
   * Format date for display
   */
  static formatDate(dateString?: string): string {
    if (!dateString) {
      return 'N/A';
    }

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Get formatted start date
   */
  getFormattedStartDate(): string {
    return SeasonModel.formatDate(this.start_date);
  }

  /**
   * Get formatted end date
   */
  getFormattedEndDate(): string {
    return SeasonModel.formatDate(this.end_date);
  }

  /**
   * Get season date range as string
   */
  getDateRange(): string {
    if (!this.start_date || !this.end_date) {
      return 'No dates set';
    }

    return `${this.getFormattedStartDate()} - ${this.getFormattedEndDate()}`;
  }
}
